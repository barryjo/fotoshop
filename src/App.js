import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ImageCard from "./components/ImageCard";
import ImageSearch from "./components/ImageSearch";
import { ConfigHelper } from "@oceanprotocol/lib";
import {
  useOcean,
  usePublish,
} from "@oceanprotocol/react";
import Wallet from "./components/Wallet";
import { NetworkMonitor } from "./components/NetworkMonitor";
import Spinner from "./components/UI/Spinner/Spinner";

const configRinkeby = new ConfigHelper().getConfig("rinkeby");
const providerOptions = {};

export const web3ModalOpts = {
  cacheProvider: true,
  providerOptions,
};


function App() {
  const [images, setImages] = useState([]);
  const [isLoadingData, setIsLoading] = useState(true);
  const [term, setTerm] = useState("tech");
  const [showModal, setShowModal] = useState(false);

  //publish fields

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");
  const [url, setURL] = useState("");
  const [sampleurl, setSampleURL] = useState("");
  const [author, setAuthor] = useState("");
  const [licence, setLicense] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [config, setConfig] = useState(configRinkeby);

  const { publish, publishStepText, isLoading } = usePublish();
  const {accountId} = useOcean()
  
  const [ddo, setDdo] = useState(null);
  const [data, setData] = useState(null);
  

  const asset = {
    main: {
      type: "dataset", //dataset
      name: title,
      dateCreated: new Date(Date.now()).toISOString().split(".")[0] + "Z", // remove milliseconds
      author,
      licence,
      files: [
        {
          url,
          checksum: "efb2c764274b745f5fc37f97c6b0e761",
          encoding: "UTF-8",
          contentLength: "4535431",
          contentType: "image/jpeg",
          compression: "zip",
        },
      ],
    },
    additionalInformation: {
      tags,
      sample: sampleurl
    },
  };

  const publishAsset = async () => {
    let ranum = parseInt(Math.random() * 100)
    const priceOptions = {
      price,
      cap: "5000",
      symbol: "AXA-" + ranum,
      name: "Fotograh Token " + ranum,
      tokensToMint: "500",
      type: "fixed",
    };

    console.log(asset);

    //   uncomment this below 2 lines
    const ddo = await publish(asset, "access", priceOptions);
    console.log(ddo);
    setDdo(ddo);
    closePopUp();
  };

  async function processData(datasets) {
    return await Promise.all(
      datasets.map((item) => {
        var metadata = item.service[0];
        var did = item.id;
        var ddo = item;
        if (metadata) {
          if (metadata.attributes) {
            var { name, author } = metadata.attributes.main;
            if(metadata.additionalInformation){
              var {tags} = metadata.additionalInformation
              console.log("Tags - ", tags)
            }
            return {
              ddo,
              did,
              name,
              author,
              tags
            };
          }
        }
      })
    );
  }

  async function handleSearch() {
    if(term != accountId){
      setShowHistory(false)
    }
    setIsLoading(true);
    try {
      let aquariusUrl = config.metadataCacheUri;
      const url = `${aquariusUrl}/api/v1/aquarius/assets/ddo/query?text=${term}&offset=500`;

      console.log(url);
      let encodedUrl = encodeURI(url);
      const response = await fetch(encodedUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const { results } = await response.json();
      console.log(results);
      let processedData = await processData(results);
      setData(processedData.slice());
      await fetchImages(term) //TODO remove
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchImages(term) {
    const response = await fetch(
      `https://pixabay.com/api/?key=${process.env.REACT_APP_PIXABAY_API_KEY}&q=${term}&image_type=photo&pretty=true`
    )
    const data = await response.json()
    console.log(data.hits)
    if(!data.hits.length){
      await fetchImages("random")
    }
    setImages(data.hits);
    //setIsLoading(false);
  }

  useEffect(() => {
    handleSearch();
  }, [term]);

  const closePopUp = () => {
    setShowModal(false);
  };

  const openPopUp = () => {
    setShowModal(true);
    let element = document.getElementById("body");
    ReactDOM.findDOMNode(element).style["overflow-y"] = "hidden";
  };

  const handleShowHistory = () => {
    setTerm(accountId)
    setShowHistory(true)
  }
  return (
    <div className="container mx-auto bg-gray-100">
      <NetworkMonitor setConfig={setConfig} />
      <Wallet />
      <main className="px-16 py-6 md:col-span-2 ">
        <div className="flex justify-center md:justify-between">
          <img className="logo" src={process.env.PUBLIC_URL + "/brand.png"} />
          <h2 className="brand">Fotoshop</h2>
          <ImageSearch searchText={(text) => setTerm(text)} />
          <a
            href="#"
            className="flex justify-center items-center rounded-full w-32 h-10 uppercase text-xs font-bold tracking-wider cursor-pointer text-primary border-primary md:border-2 hover:bg-red-700 hover:text-white transition ease-out duration-500"
            onClick={openPopUp}
          >
            Publish
          </a>
          <a
            href="#"
            className="flex justify-center items-center rounded-full w-32 h-10 uppercase text-xs font-bold tracking-wider cursor-pointer text-primary border-primary md:border-2 hover:bg-red-700 hover:text-white transition ease-out duration-500"
            onClick={handleShowHistory}
          >
            History
          </a>
        </div>

        {!isLoadingData && data.length === 0 && (
          <h1 className="text-5xl text-center mx-auto mt-32">
            No Fotos Found
          </h1>
        )}

        {isLoadingData ? (
          <Spinner />
        ) : (
          <div className="mt-8 grid lg:grid-cols-3 gap-10">
            {data.map((item, i) => (
              <ImageCard
                key={item.did}
                id={item.did}
                image={images[i]}
                data={item}
                tags={images[i] && images[i].tags ? images[i].tags : null}
                isLoading={setIsLoading}
                showBuyButton={!showHistory}
              />
            ))}
          </div>
        )}
      </main>

      {showModal ? (
        <div
          className="bg-black opacity-75  absolute inset-0 flex justify-center items-center"
          id="overlay"
        ></div>
      ) : (
        " "
      )}

      {showModal ? (
        isLoading ? (
          <div className=" absolute inset-0 flex justify-center items-center">
            <Spinner text={publishStepText} />
          </div>
        ) : (
          <div className=" absolute inset-0 flex justify-center items-center">
            <div className="bg-gray-300  py-2 px-3 rounded shadow-xl text-gray-800">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">Enter Details</h4>
                <svg
                  className="h-6 w-6 cursor-pointer p-1 hover:bg-gray-300 rounded-full"
                  id="close-modal"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  onClick={closePopUp}
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="mt-2 text-sm">
                <form className="w-full max-w-lg">
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlhtmlFor="grid-first-name"
                      >
                        Foto Title
                      </label>
                      <input
                        required
                        onChange={(e) => setTitle(e.target.value)}
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                        id="grid-first-name"
                        type="text"
                        placeholder=""
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="grid-last-name"
                      >
                        Price
                      </label>
                      <input
                        type="number"
                        required
                        onChange={(e) => setPrice(e.target.value)}
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="grid-last-name"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Tags (comma seperated)
                      </label>
                      <textarea
                        onChange={(e) => setTags(e.target.value)}
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="grid-password"
                        type="text"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Foto Main URL
                      </label>
                      <input
                        required
                        onChange={(e) => setURL(e.target.value)}
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="grid-password"
                        type="text"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Foto Sample URL
                      </label>
                      <input
                        required
                        onChange={(e) => setSampleURL(e.target.value)}
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="grid-password"
                        type="text"
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-2">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="grid-city"
                      >
                        Fotograph By
                      </label>
                      <input
                        required
                        onChange={(e) => setAuthor(e.target.value)}
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="grid-city"
                        type="text"
                        placeholder=""
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="grid-zip"
                      >
                        License
                      </label>
                      <input
                        required
                        onChange={(e) => setLicense(e.target.value)}
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="grid-zip"
                        type="text"
                        placeholder=""
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="mt-3 flex justify-end space-x-3">
                <input
                  type="submit"
                  className="px-3 py-1 bg-red-800 text-gray-200 hover:bg-red-600 rounded"
                  onClick={publishAsset}
                  value="Register"
                />
              </div>
            </div>
          </div>
        )
      ) : (
        ""
      )}
      
    </div>
  );
}

export default App;
