 function isBackendProd(isProd) {
    const server={
        dev:"http://localhost:5173",
        prod:"https://valk-backend.onrender.com"
    }
    if(isProd){
        return server.prod
    }else{
        return server.dev
    }
 } 

 export default isBackendProd;