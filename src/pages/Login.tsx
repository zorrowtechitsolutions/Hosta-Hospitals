import { useEffect } from "react";
import EmailLogin from "./EmailLogin";
import HospitalOtpLogin from "./OtpLogin";


const HospitalLogin: React.FC = () => {
    
  const userId  = localStorage.getItem("userId")

  useEffect(() => {

  }, [userId])

  return (
    <>
      {
        userId ?  <EmailLogin /> : <HospitalOtpLogin />
      }
    </>
  );
};

export default HospitalLogin;


