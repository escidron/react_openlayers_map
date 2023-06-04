import React,{useEffect,useState,useRef} from "react";
import axios from 'axios'
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import "ol/ol.css";
import './App.css'
import { RMap, ROSM, RLayerVector, RFeature, RStyle,ROverlay,RPopup } from "rlayers";
import greenIcon from '../src/public/greenIcon.png'
import redIcon from '../src/public/redIcon.gif'
import { FadeLoader } from "react-spinners";
export default function App() {
    const [data, setData] = useState([]);
    const [alias, setAlias] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [refetching, setRefetching] = useState(false);
    const [hover, setHover] = useState('');


    useEffect(()=>{
      const getData = async ()=>{
           await axios.get('http://server.palmapp.com.br:8082/rest/PALM/v1/AppClientesPalm?Token=4c3ss044p1p4lm_c0n5ult4_3mpr3s4s')
          .then(function(res){
            let replacedStr = res.data.slice(1, -1);
            let result = "[" + replacedStr + "]";
            setData(JSON.parse(result))
            console.log('actualizo los datos')
          }).catch(function(err){
              console.log(err)
          })
        }

      getData()  
      const interval = setInterval(() => {
        console.log("Triggered every 1 minute!");
        setRefetching(true)
        getData()  
        console.log('vvvvvvvvvvvvvv')
      }, 60000); 
      
      return () => clearInterval(interval);
    },[])
  useEffect(() => {
    if (data.length>0){
      console.log('zzzzzzzz')
        if (alias.length===0 ||loaded){
          const promises = data.map(url => {
            let getURL = ''

            if(url.ENDPOINT.includes('http://')){
              getURL = url.ENDPOINT
            }else{
              getURL = 'http://'+url.ENDPOINT
            }
            return fetch(getURL)
              .then(response => response)
              .catch(error => {
                // Handle any error that occurred during the HTTP request
                // console.error(`Error fetching ${url}:`, error);
                // throw error;
              });
          });
          Promise.all(promises)
            .then(results => {
              // Handle the resolved values (responses) from all promises
              console.log('All requests completed:', results);
              var statusAlias = []
              if(!loaded || refetching ){

                results.map((item)=>{
                  if(item!==undefined){
                    statusAlias.push({url:item.url})
                  }
                  return null
                })
                setAlias(statusAlias)
                setLoaded(true)
                console.log('atualizou status')
                // setRefetching(false)
              }
            })
            .catch(error => {
              // Handle any error that occurred during Promise.all()
              console.error('Error with Promise.all():', error);
            });
        }
    }

}, [data]);

    return (
      <div className="wrapper">
        {loaded?
        <RMap
          className="map"
          initial={{ center: fromLonLat([-32.1124, -16.1793]), zoom: 5 }}
        >
        <ROSM />
        <div className="list">
          <div className="header">
            <p className="list-header">Status</p>
            <p className="list-header">Cliente</p>
            <p className="list-header">Alias</p>
            <p className="list-header">Ult.Consulta</p>
            <p className="list-header">Transações</p>
          </div>
        {data.map((item,index) => {
          const currentTime = new Date();
          const hours = currentTime.getHours();
          const minutes = currentTime.getMinutes().length===1?'0'+currentTime.getMinutes():currentTime.getMinutes();
          const seconds = currentTime.getSeconds().length===1?'0'+currentTime.getSeconds():currentTime.getSeconds();
          let getURL = ''
          let icon  = ''
          if(item.ENDPOINT.includes('http://')){
              getURL = item.ENDPOINT
          }else{
              getURL = 'http://'+item.ENDPOINT
          }
          const foundElement = alias.find(item => item.url === getURL);

          if (foundElement !== undefined) {
            icon =greenIcon
          } else {
            icon = redIcon
          }
          return(
            
            <div  key={item.ALIAS}>

                <RLayerVector zIndex={10}  >
                  <RFeature
                    
                    
                    geometry={new Point(fromLonLat([item.LONGITUDE,item.LATITUDE]))}
                    onClick={(e) =>
                      e.map.getView().fit(e.target.getGeometry().getExtent(), {
                        duration: 250,
                        maxZoom: 10,
                      })

                    }
                    >
                    <ROverlay className='no-interaction' >
                      <img 
                          onMouseOver={()=>{                           
                                console.log(item.ALIAS)                          
                                setHover(item.ALIAS)
                                }}
                          onMouseOut={()=>setHover('')}
                          className='feature'
                          src= { icon}
                          style={{
                            position: 'relative',
                            top: -15,
                            left: -15,

                        }}
                          width={25}
                          height={25}
                          alt='animated icon'
                      />
                    </ROverlay>
                    
                      <ROverlay className={` ${hover===item.ALIAS?'show-popup ':'hide-popup'}`}>
                      <div className='hoverDivLogo'>
                        <img className="hoverLogo"  src={item.URLLOGO}  alt="fireSpot"/>
                      </div>
                      </ROverlay>
                    
                  </RFeature>
                </RLayerVector>   
              <div className="items">             
                
                <div className='clientLogo'>
                  <img className="status"  
                  src={icon}  
                  alt="status"/>
                </div>
                
                <div className='clientLogo'>
                  <img className="logo"  src={item.URLLOGO}  alt="fireSpot"/>
                </div>
                <p className="list-item">{item.ALIAS}</p>
                <p className="list-item consulta">{`${hours}:${minutes}:${seconds}`}</p>
                <p className="list-item pill">{item.TRANSACOES}</p>
              </div>  
            </div>
          )
        })
        
      }
        </div> 
        </RMap>
        :(
          <div className="loading-page"> 
            <FadeLoader color="#36d7b7" />
          </div>
        )
        }
      </div> 

    );
}