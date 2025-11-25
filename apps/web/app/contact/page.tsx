// apps/web/app/contact/page.tsx
import { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact - Harbor',
  description: 'Get in touch with the Harbor team. We\'d love to hear from you.',
  openGraph: {
    title: 'Contact - Harbor',
    description: 'Get in touch with the Harbor team. We\'d love to hear from you.',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
