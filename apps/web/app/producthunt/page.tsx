import ProductHuntIndex from './ProductHuntIndex'

export const metadata = {
  title: 'How AI Sees Product Hunt | Harbor',
  description: 'See how ChatGPT, Perplexity, and Claude rank and describe the top products that launched on Product Hunt.',
  openGraph: {
    title: 'How AI Sees Product Hunt | Harbor',
    description: 'See how ChatGPT, Perplexity, and Claude rank and describe the top products that launched on Product Hunt.',
  }
}

export default function ProductHuntPage() {
  return <ProductHuntIndex />
}
