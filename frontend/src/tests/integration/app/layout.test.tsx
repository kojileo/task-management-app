import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mock-inter-font',
  }),
}));

describe('RootLayout Integration Tests', () => {
  it('子要素とToasterを正しくレンダリングする', () => {
    const testContent = 'テストコンテンツ';
    render(
      <RootLayout>
        <div>{testContent}</div>
      </RootLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(document.querySelector('html')).toHaveAttribute('lang', 'ja');
    expect(document.querySelector('body')).toHaveClass('mock-inter-font');
  });
});
