import Script from 'next/script'
import Adsense from './Source'

const isDevelopment = process.env.NODE_ENV === 'development'

export default function InArticle({ Component, pageProps }) {
  if (!isDevelopment) {
    return (
      <>
        {' '}
        <Component {...pageProps} />
        <ins
          class="adsbygoogle"
          style="display:block; text-align:center;"
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-2972286297839505"
          data-ad-slot="6040596879"
        ></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </>
    )
  } else {
    return (
      <>
        <div>Adsense Placeholder</div>
      </>
    )
  }
}
