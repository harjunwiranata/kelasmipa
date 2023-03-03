import Script from "next/script"

const isDevelopment = process.env.NODE_ENV === 'development'

export default function Adsense() {
  if (!isDevelopment) {
    return(
        <>
        <Script
          id="Adsense-id"
          onError={(e) => {console.log(e)}}
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2972286297839505"
          crossOrigin="anonymous"
          async
        ></Script>
        </>
    )}
}