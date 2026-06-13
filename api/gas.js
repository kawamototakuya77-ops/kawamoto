export default async function handler(req, res) {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";
  
  try {
    // クエリパラメータをそのままGASに渡す
    const searchParams = new URLSearchParams(req.query).toString();
    const fetchUrl = `${GAS_URL}?${searchParams}`;
    
    // Vercelサーバー側でGASにアクセス（これならSafariの制限に一切引っかからない）
    const response = await fetch(fetchUrl, {
      method: 'GET',
      redirect: 'follow'
    });
    
    const data = await response.json();
    
    // クライアント（LINEやSafari）にそのままJSONを返す
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ success: false, error: "Vercel Proxy Error: " + error.message });
  }
}
