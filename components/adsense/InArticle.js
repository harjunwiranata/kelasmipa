import Script from 'next/script'
import { useEffect } from 'react'

const isDevelopment = process.env.NODE_ENV === 'development'
export default function InArticle() {
  const adStyle = { display: 'block', textAlign: 'center' }
  if (!isDevelopment) {
    return (
      <div>
        <ins
          className="adsbygoogle"
          style={adStyle}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-2972286297839505"
          data-ad-slot="6040596879"
        ></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({})</script>
      </div>
    )
  } else {
    return (
      <>
        <div>Adsense Placeholder</div>
      </>
    )
  }
}
