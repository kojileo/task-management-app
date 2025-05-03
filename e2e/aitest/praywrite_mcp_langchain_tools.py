import json
import re
import os
import sys
import logging
import asyncio
import warnings
import operator
import datetime
import time
from dotenv import load_dotenv, find_dotenv
from typing_extensions import TypedDict
from typing import Any, Callable, Dict, Iterable, List, Optional, TypedDict, Annotated

# 警告の抑制
warnings.filterwarnings("ignore", message="unclosed transport")
warnings.filterwarnings("ignore", message="I/O operation on closed pipe")
warnings.filterwarnings("ignore", message="Key 'additionalProperties' is not supported in schema")
warnings.filterwarnings("ignore", message="Key '\$schema' is not supported in schema")

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, SystemMessage, AnyMessage, ToolMessage

from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from langchain_mcp_adapters.client import MultiServerMCPClient

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_ = load_dotenv(find_dotenv())
google_api_key = os.getenv("GOOGLE_APIKEY")

class GraphState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]

def load_config():
    """設定ファイルの読み込み"""
    try:
        with open("mcp_config.json", "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"設定ファイルの読み込みに失敗しました: {e}")
        raise

def create_graph(state: GraphState, tools, model_chain):
    """ワークフローグラフの作成"""
    def should_continue(state: state):
        messages = state["messages"]
        last_message = messages[-1]
        if last_message.tool_calls:
            return "tools"
        return END

    def call_model(state: state):
        messages = state["messages"]
        response = model_chain.invoke(messages)
        return {"messages": [response]}

    tool_node = ToolNode(tools)
    
    workflow = StateGraph(state)
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", tool_node)

    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges("agent", should_continue, ["tools", END])
    workflow.add_edge("tools", "agent")
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

async def cleanup():
    """リソースのクリーンアップ"""
    try:
        logger.info("リソースのクリーンアップを開始します")
        # 必要に応じて他のリソースのクリーンアップをここに追加
    except Exception as e:
        logger.error(f"リソースのクリーンアップ中にエラーが発生しました: {e}")

def create_test_report(test_number: str, response: str) -> dict:
    """テスト結果をレポート形式に変換する"""
    return {
        "test_number": test_number,
        "timestamp": datetime.datetime.now().isoformat(),
        "response": response,
    }

def save_test_results(results: List[dict]):
    """テスト結果をJSONファイルに保存する"""
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        results_dir = os.path.join(os.path.dirname(__file__), "results")
        filename = os.path.join(results_dir, f"test_results_{timestamp}.json")
        
        # 結果ディレクトリが存在しない場合は作成
        os.makedirs(results_dir, exist_ok=True)
        
        # 結果を整形して保存
        formatted_results = []
        for result in results:
            formatted_result = {
                "test_number": result.get("test_number", "unknown"),
                "timestamp": result.get("timestamp", datetime.datetime.now().isoformat()),
                "response": result.get("response", ""),
                "status": "success" if "エラー" not in str(result.get("response", "")) else "error"
            }
            formatted_results.append(formatted_result)
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(formatted_results, f, ensure_ascii=False, indent=2)
        logger.info(f"テスト結果を {filename} に保存しました")
        
        # 結果のサマリーを表示
        total_tests = len(formatted_results)
        success_tests = sum(1 for r in formatted_results if r["status"] == "success")
        error_tests = total_tests - success_tests
        logger.info(f"テスト結果サマリー: 合計 {total_tests} 件, 成功 {success_tests} 件, 失敗 {error_tests} 件")
        
    except Exception as e:
        logger.error(f"テスト結果の保存中にエラーが発生しました: {e}")
        logger.error(f"エラーの詳細: {str(e)}")
        logger.error(f"保存しようとした結果: {results}")

# レート制限の設定
MAX_RETRIES = 3
RETRY_DELAY = 60  # レート制限エラー時の待機時間を60秒に延長
API_COOLDOWN = 1  # API呼び出し間のクールダウン時間（秒）

async def main(graph_config = {"configurable": {"thread_id": "12345"}}, input_list=None):
    try:
        test_results = []
        
        # テスト入力ファイルの読み込み
        if input_list is None:
            input_file = os.path.join(os.path.dirname(__file__), "test_inputs.json")
            try:
                with open(input_file, "r", encoding="utf-8") as f:
                    input_list = json.load(f)
                logger.info(f"テスト入力ファイルを読み込みました: {input_file}")
            except Exception as e:
                logger.error(f"テスト入力ファイルの読み込みに失敗しました: {e}")
                return

        # モデルの定義
        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=google_api_key,
            temperature=0.001,
        )

        mcp_config = load_config()

        # メッセージの作成
        message = [
            SystemMessage(content="""
あなたは役にたつAIアシスタントです。日本語で回答し、考えた過程を結論より前に出力してください。
あなたは、「PlayWrite」というブラウザを操作するtoolを利用することができます。適切に利用してユーザからの質問に回答してください。
ツールを利用する場合は、必ずツールから得られた情報のみを利用して回答してください。

まず、ユーザの質問からツールをどういう意図で何回利用しないといけないのかを判断し、必要なら複数回toolを利用して情報収集をしたのち、すべての情報が取得できたら、その情報を元に返答してください。

なお、サイトのアクセスでエラーが出た場合は、もう一度再施行してください。ネットワーク関連のエラーの場合があります。
            """),
            MessagesPlaceholder("messages"),
        ]

        prompt = ChatPromptTemplate.from_messages(message)

        async with MultiServerMCPClient(mcp_config["mcpServers"]) as mcp_client:
            tools = mcp_client.get_tools()
            model_with_tools = prompt | model.bind_tools(tools)
            graph = create_graph(GraphState, tools, model_with_tools)

            input_iter = iter(input_list) if input_list else None

            while True:
                try:
                    if input_iter:
                        try:
                            query = next(input_iter)
                            logger.info(f"入力: {query}")
                            test_number = query.split("→")[0]
                        except StopIteration:
                            logger.info("入力リストが終了しました。")
                            if test_results:
                                save_test_results(test_results)
                            break
                    else:
                        query = input("入力してください: ")

                    if query.lower() in ["exit", "quit"]:
                        logger.info("終了します。")
                        if test_results:
                            save_test_results(test_results)
                        break

                    input_query = [HumanMessage([
                        {
                            "type": "text",
                            "text": f"{query}"
                        },
                    ])]

                    retry_count = 0
                    while retry_count < MAX_RETRIES:
                        try:
                            # API呼び出しの前にクールダウン
                            await asyncio.sleep(API_COOLDOWN)
                            
                            response = await graph.ainvoke({"messages":input_query}, graph_config)
                            logger.debug(f"レスポンス: {response}")
                            break
                        except Exception as e:
                            if "ResourceExhausted" in str(e):
                                retry_count += 1
                                if retry_count < MAX_RETRIES:
                                    logger.warning(f"レート制限に達しました。{RETRY_DELAY}秒後に再試行します... (試行 {retry_count}/{MAX_RETRIES})")
                                    await asyncio.sleep(RETRY_DELAY)
                                    continue
                                else:
                                    logger.error("最大リトライ回数を超えました。テストをスキップします。")
                                    if input_iter:
                                        test_results.append(create_test_report(test_number, f"エラー: レート制限によりテストを実行できませんでした"))
                                    break
                            else:
                                raise

                    result = response["messages"][-1].content
                    print("=================================")
                    print(result)

                    if input_iter:
                        test_results.append(create_test_report(test_number, result))

                except Exception as e:
                    logger.error(f"処理中にエラーが発生しました: {e}")
                    if input_iter:
                        test_results.append(create_test_report(test_number, f"エラー: {str(e)}"))
                    continue

    except Exception as e:
        logger.error(f"メイン処理でエラーが発生しました: {e}")
        raise
    finally:
        # リソースのクリーンアップ
        try:
            await cleanup()
            # イベントループのクリーンアップ
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.close()
        except Exception as e:
            logger.error(f"クリーンアップ中にエラーが発生しました: {e}")

if __name__ == "__main__":
    try:
        # イベントループの設定
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(main())
    except Exception as e:
        logger.error(f"プログラムの実行中にエラーが発生しました: {e}")
    finally:
        # イベントループのクリーンアップ
        try:
            loop.close()
        except Exception as e:
            logger.error(f"イベントループのクローズ中にエラーが発生しました: {e}")

