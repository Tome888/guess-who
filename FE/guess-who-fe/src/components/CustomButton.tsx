interface CusBtn {
  innerTxt: string;
  cusCls?: string;
  btnFuc: () => void;
}

function CustomButton({ innerTxt, cusCls, btnFuc }: CusBtn) {
  return (
    <button onClick={() => btnFuc()} className={`uiverse ${cusCls}`}>
      <div className="wrapper">
        <span>{innerTxt}</span>
        <div className="circle circle-12"></div>
        <div className="circle circle-11"></div>
        <div className="circle circle-10"></div>
        <div className="circle circle-9"></div>
        <div className="circle circle-8"></div>
        <div className="circle circle-7"></div>
        <div className="circle circle-6"></div>
        <div className="circle circle-5"></div>
        <div className="circle circle-4"></div>
        <div className="circle circle-3"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-1"></div>
      </div>
    </button>
  );
}
export default CustomButton;
