import React, { useEffect, useState, useRef } from "react";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import "ol/ol.css";
import "./App.css";
import { RMap, ROSM, RLayerVector, RFeature, ROverlay } from "rlayers";
import greenIcon from "../src/public/greenIcon.png";
import redIcon from "../src/public/redIcon.gif";
import { FadeLoader } from "react-spinners";
import nouser from "./assets/user1.png";
// import './public/data.json'

export default function App() {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [lastRequest, setLastRequest] = useState("");




  const fetchData = () => {
    fetch("./data.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const groupedUsers = data.data.reduce((groups, user) => {
          const key = `${user.latitude}-${user.longitude}`;
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(user);
          return groups;
        }, {});

        // Convert the grouped data into an array of arrays
        const groupedUsersArray = Object.values(groupedUsers);

        setData(groupedUsersArray);
        setLoaded(true);
      })
      .catch((error) => {
        console.log("error loading json: ", error);
      });
  };

  useEffect(() => {
    fetchData(); // Chama a função imediatamente ao montar o componente

    const intervalId = setInterval(() => {
      fetchData(); // Chama a função a cada 5 minutos (300000 milissegundos)
    }, 300000); // 300000 milissegundos = 5 minutos

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="wrapper">
      {loaded ? (
        <RMap
          className="map"
          initial={{ center: fromLonLat([-46.6388, -22.9089]), zoom: 9 }}
        >
          <ROSM />
          {data.map((item, index) => {
            console.log("itemm", item[0]);
            console.log("itemm length", item.length);
            console.log("index", index);
            return (
              <>
                {item.length === 1 ? (
                  <div key={index + item[0].name}>
                    <RLayerVector zIndex={10}>
                      <RFeature
                        geometry={
                          new Point(
                            fromLonLat([item[0].longitude, item[0].latitude])
                          )
                        }
                        onClick={(e) =>
                          e.map
                            .getView()
                            .fit(e.target.getGeometry().getExtent(), {
                              duration: 250,
                              maxZoom: 10,
                            })
                        }
                      >
                        <ROverlay>
                          <div
                            className={`speech-bubble speech-bubble-${index}`}
                            style={{
                              backgroundColor: item[0].cor,
                            }}
                            key={index}
                          >
                            <style key={index}>
                              {`
                            .speech-bubble-${index}::after {
                              border-top-color: ${
                                item[0].cor || "#ff0000"
                              }; // Padrão ou personalizado
                            }
                          `}
                            </style>
                            <div className="user-info">
                              <img
                                className="user-image"
                                src={item[0].foto ? item[0].foto : nouser}
                                alt="fireSpot"
                              />
                              <p className="user-name">{item[0].nome}</p>
                              <p className="user-name">{`[${item[0].hora_inicio} - ${item[0].hora_fim}]`}</p>
                            </div>
                            <img
                              className="client-image"
                              src={item[0].logo ? item[0].logo : nouser}
                              alt="fireSpot"
                            />
                          </div>
                        </ROverlay>
                      </RFeature>
                    </RLayerVector>
                  </div>
                ) : (
                  //varios funcionarios no mesmo local
                  <div key={index}>
                    <RLayerVector zIndex={10}>
                      <RFeature
                        geometry={
                          new Point(
                            fromLonLat([item[0].longitude, item[0].latitude])
                          )
                        }
                        onClick={(e) =>
                          e.map
                            .getView()
                            .fit(e.target.getGeometry().getExtent(), {
                              duration: 250,
                              maxZoom: 10,
                            })
                        }
                      >
                        <ROverlay>
                          <div
                            className={`speech-bubble-group speech-bubble-group-${index}`}
                            style={{
                              backgroundColor: item[0].cor,
                            }}
                            key={index}
                          >
                            <style key={index}>
                              {`
                          .speech-bubble-group-${index}::after {
                            border-top-color: ${
                              item[0].cor || "#ff0000"
                            }; // Padrão ou personalizado
                          }
                        `}
                            </style>
                            <div className="group-container">
                              {item.map((element,index2) => {
                                console.log("element", element);
                                console.log("element", element.logo);
                                console.log("index2", index2);
                                return (
                                  <div
                                    className="group-user-info"
                                    key={element.id}
                                  >
                                    <div className="user-info">
                                      <img
                                        className="user-image"
                                        src={
                                          element.foto ? element.foto : nouser
                                        }
                                        alt="fireSpot"
                                      />
                                      <p className="user-name">
                                        {element.nome}
                                      </p>
                                      <p className="user-name">{`[${element.hora_inicio} - ${element.hora_fim}]`}</p>
                                    </div>
                                    {
                                      index2 === 0 && (

                                        <img
                                          className="client-image"
                                          src={element.logo ? element.logo : nouser}
                                          alt="fireSpot"
                                        />
                                      )
                                    }
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </ROverlay>
                      </RFeature>
                    </RLayerVector>
                  </div>
                )}
              </>
            );
          })}
        </RMap>
      ) : (
        <div className="loading-page">
          <FadeLoader color="#36d7b7" />
        </div>
      )}
    </div>
  );
}
