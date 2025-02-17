import React, {useEffect, useState} from "react";
import MessageBox from "../MessageBox/MessageBox.jsx";
import * as style from "./Home.module.scss";
import useUserStore from "../State/userStore.js";
import {useNavigate, Link} from "react-router-dom";

const Home = () => {
       const navigate = useNavigate();
       const {
              accessToken,
              setAccessToken,
              updateUserData,
              userName,
              userEmail,
              connectSocket
       } = useUserStore();

       const [loading, setLoading] = useState(true);

       const refreshAccessToken = async () => {
              try {
                     const response = await fetch("/api/refreshAccessToken", {
                            method: "POST"
                     });
                     const data = await response.json();

                     if (data.success) {
                            setAccessToken(data.accessToken);
                            updateUserData();
                     }

                     console.log(data.message);
              }
              catch (err) {
                     console.error(err);
              }
              finally {
                     setLoading(false);
              }
       };

       const handleLogout = async (event) => {
              const response = await fetch("/api/logout", {
                     method: "POST"
              });
              const data = await response.json();

              if (data.success) {
                     setAccessToken(null);
              }

              console.log(data.message);
       };

       useEffect(() => {
              if (!accessToken) {
                     refreshAccessToken();
              }
              else {
                     updateUserData();
                     setLoading(false);
              }
       }, []);

       useEffect(() => {
              if (!userEmail) return;

              connectSocket(userEmail);
       }, [userEmail]);

       if (loading) {
              return <div>Loading...</div>
       }

       return (
              <>
                     {accessToken ?
                            <>
                                   <div>{userName}</div>
                                   <div>{userEmail}</div>
                                   <MessageBox />
                                   <button onClick={handleLogout}>Logout</button>
                            </> :
                            <>
                                   <Link to="/login">Login</Link>
                            </>
                     }
              </>
       );
};

export default Home;