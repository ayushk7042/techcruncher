import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams } from "react-router-dom";

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    api.get(`/news/${id}`).then((res) => setNews(res.data));
  }, [id]);

  const clickAffiliate = (index) => {
    api.post("/news/affiliate-click", {
      newsId: id,
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
