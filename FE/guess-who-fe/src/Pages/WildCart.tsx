import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function WildCart() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, []);
  return <h2>Loading...</h2>;
}
export default WildCart;
