import './App.css';
import {useEffect,useState} from 'react';
import {Routes,Route,useNavigate} from 'react-router-dom';
import Home from './pages/HomePage/Home';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import PageNotFound from './pages/ErrorPages/PageNotFound/PageNotFound';
import Main from './components/Main/Main';
import jwt_decode from "jwt-decode";
import {login} from "./services/LoginService";
import { useSelector, useDispatch} from 'react-redux';
import { loginUser,logoutUser,newNotification,cancelNotification } from './actions/index';
import { useCookies } from 'react-cookie';
import { useLogin,useNotification } from "./helper";
import Notification from "./components/Notification/Notification";
function App() {
  const state = useSelector(state => state);
  const dispatch = useDispatch();
  const [user,setUser] = useState(null);
  const redirect = useNavigate();
  const [curUser,userLogin,userLogout] = useLogin();
  const [visible,text,type,newNotification] = useNotification();
  const clientId = "1025507377861-ksv14u42p6c0bes203hkbki7n56u6v80.apps.googleusercontent.com";
  const [cookies,setCookie] = useCookies(["user"]);
  const handleCredentialResponse = async (responce) =>{
    var data = jwt_decode(responce.credential);
    if(data.aud == clientId){
      
      var reg = false;
      await login(data.email,data.aud).then(async (res)=>{
        if(res.data.status == 200){
          setUser({
            is_logged:true
          });
          reg = true;
          dispatch(loginUser({
            user:{
              email:data.email,
              name:data.name,
              picture:data.picture,
              phone: data.phone,
              dob:data.dob,
              course:data.course,
              ...res.data.content
            },
            is_logged:true
          }));
          //onLogin(user);
          userLogin({email:data.email,...res.data.content});
        }else{
          setUser({});
          dispatch(logoutUser());
          userLogout();
          reg = false;
        }
      }).catch(err=>{
        console.log(err);
        setUser({});
        dispatch(logoutUser());
        userLogout();
        reg = false;
      });
      
     // document.getElementById("res").textContent = ""+Object.keys(data);
      if(!reg) {
        dispatch(logoutUser());
        setUser({
          email:data.email,
          name:data.name,
          picture:data.picture,
          phone: null,
          dob:null,
          course:null,
          is_logged:false,
          token:null,
          aud:data.aud,
        });
        return redirect("/register");
      }
     // else return redirect("/");
    }
  };
  useEffect(() => {
    //userLogout();
    var logg = curUser.is_logged;
    /* global google */
   google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse
    });
    if(!logg) google.accounts.id.prompt();
    else{
      setUser({
        userId:curUser.userId,
        email:curUser.email,
        token:curUser.token,
        expiry:curUser.expiry
      });
      dispatch(loginUser({
        user:{
          userId:curUser.userId,
          email:curUser.email,
          token:curUser.token,
          expiry:curUser.expiry
        },
        is_logged:logg
      }));
    }
  },[curUser]);
  
  return (
    <Main>
      <Notification visible={visible} text={text} type={type}/>
      {<h6 onClick={()=>{dispatch(newNotification("Hello"))}} className="underlined">hi {JSON.stringify(curUser)+"|"+JSON.stringify(state)}</h6>}
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/register" element={<Register user={user} setUser={setUser}/>}/>
        <Route path="*" element={<PageNotFound/>}/>
      </Routes>
    </Main>
  );
}

export default App;
