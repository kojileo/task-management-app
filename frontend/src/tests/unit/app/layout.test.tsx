import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  it('コンテンツが正しく表示される', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>テストコンテンツ</div>
      </RootLayout>,
      { container: document.documentElement }
    );

    expect(document.body).toHaveTextContent('テストコンテンツ');
    expect(getByTestId('toaster')).toBeInTheDocument();
  });

  it('Interフォントが適用されている', () => {
    render(
      <RootLayout>
        <div>テストコンテンツ</div>
      </RootLayout>,
      { container: document.documentElement }
    );

    // body要素にInterフォントのクラスが適用されていることを確認
    expect(document.body).toHaveClass('inter');

    // html要素のlang属性が正しく設定されていることを確認
    expect(document.documentElement).toHaveAttribute('lang', 'ja');
  });
});
