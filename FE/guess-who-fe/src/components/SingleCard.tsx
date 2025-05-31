interface SingleCardProps {
  picture: string;
  nameAgent: string;
}

function SingleCard({ picture, nameAgent }: SingleCardProps) {
  return (
    <>
      <div className="wrapper">
        <img src={picture} className="cover-image" />
      </div>
      <p className="title">{nameAgent}</p>
      <img src={picture} className="character" />
    </>
  );
}

export default SingleCard;
