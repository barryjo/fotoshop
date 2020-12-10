import React, { useEffect } from "react";
import {
  useConsume,
  useOcean,
  usePricing,
  useMetadata,
} from "@oceanprotocol/react";

const did =
  "did:op:0d03188f80224d31937a9581ac573038d86ea959063149119ed7ba783b46fb87";

const cardType = {
  card: "rounded bg-white border-gray-200 shadow-md overflow-hidden relative",
  badge:
    "absolute top-0 ml-2 p-2 mt-2 bg-gray-400 text-secondary-200 text-xs uppercase font-bold rounded-full",
  button:
    "rounded-full py-2 px-3 uppercase text-xs font-bold tracking-wider cursor-pointer",
  delete: "bg-red-300 hover:bg-red-500 text-white font-bold rounded",
};

const ImageCard = ({ image, handleClick, data, tags, isLoading, showBuyButton }) => {
  // consume asset
  const { ocean, accountId } = useOcean();
  const { consumeStepText, consume, consumeError } = useConsume();
  const { buyDT } = usePricing(data.ddo);

  const handleDownload = async (data) => {
    await buyDT("1");
    // use own accountId for marketFeeAddress for testing purposes
    isLoading(true);
    await consume(data.did, data.ddo.dataToken, "access", accountId);
    console.log(consumeError);
    console.log(consumeStepText);
    isLoading(false);
  };
  const taggs = tags ? tags.split(",") : ["no-tags"];

  return (
    <div className={cardType.card}>
      <div className="card hover:shadow-lg">
        <img
          src={image && image.webformatURL ? image.webformatURL : "https://img.flaticon.com/icons/png/512/146/146958.png?size=357x192f&pad=10,10,10,10&ext=png&bg=CCCCCC"}
          alt=""
          className="h-32 sm:h-48 w-full object-cover"
          onClick={handleClick}
        />
        <div className="m-4">
          <span className="font-bold">{data.name}</span>
          <span className="block text-gray-500 text-sm">
            Photo by {data.author}
          </span>
        </div>
        {showBuyButton ? (<a
          href="#"
          className="rounded-full py-2 px-4 uppercase text-xs font-bold tracking-wider 
         cursor-pointer text-primary border-primary md:border-2 hover:bg-red-700 
         hover:text-white transition ease-out duration-500 absolute mb-20 mr-2 bottom-0 right-0"
          onClick={() => handleDownload(data)}
        >
          Buy
        </a>) : ""}
        
        <div className="px-6 py-4">
          {taggs.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className={cardType.badge}>
          <span>
            {data.ddo.price.value
              ? `${data.ddo.price.value.toFixed(2)} OCEAN`
              : "FREE"}{" "}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
