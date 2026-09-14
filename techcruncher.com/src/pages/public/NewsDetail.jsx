import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams } from "react-router-dom";

const NewsDetail = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    api.get(`/news/${slug}`).then((res) => setNews(res.data));
  }, [slug]);

  const clickAffiliate = (index) => {
    api.post("/news/affiliate-click", {
      newsId: news?._id,
      affiliateIndex: index
    });
  };

  if (!news) return null;

  return (
    <div>
      <h1>{news.title}</h1>
      {news.affiliateLinks?.map((a, i) => (
        <button onClick={() => clickAffiliate(i)}>{a.buttonText}</button>
      ))}
    </div>
  );
};

export default NewsDetail;
