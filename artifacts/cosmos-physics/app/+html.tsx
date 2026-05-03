import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        {/* Hide the Replit pill badge — runs synchronously before deferred bundle */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: [
              "(function(){",
              "var s=document.createElement('style');",
              "s.textContent='replit-pill{display:none!important;visibility:hidden!important;}';",
              "document.head.appendChild(s);",
              "var ob=new MutationObserver(function(){",
              "var e=document.querySelector('replit-pill');",
              "if(e){e.style.setProperty('display','none','important');}",
              "});",
              "ob.observe(document.documentElement,{childList:true,subtree:true});",
              "})();",
            ].join(""),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
