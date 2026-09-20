// The standalone route for one card. Deep links, the Print page's back link and
// the redirect after saving a new card all land here; the panel itself is shared
// with /cards.
import { useLocation, useParams, Link } from "react-router-dom";
import CardDetail from "../components/CardDetail.jsx";

export default function CardView() {
  const { id } = useParams();
  const { state } = useLocation();

  return (
    <main className="page page-detail">
      <Link to="/cards" className="btn-text back-link">Back to my cards</Link>
      <CardDetail id={id} showMap notice={state?.notice} created={state?.created} />
    </main>
  );
}
