import React, { useState, useRef, useEffect } from "react";
import { useAlert } from "react-alert";
import "./VoteLock.css";

export default function VoteLock({
  web3,
  ElectionInstance,
  admin,
  isAdmin,
  unlockVote,
}) {
  const alert = useAlert();
  const [otp, setOtp] = useState(Array(8).fill(""));

  const otpRefs = useRef([]);

  if (otpRefs.current.length !== 8) {
    otpRefs.current = Array(8)
      .fill(null)
      .map((_, i) => otpRefs.current[i] || React.createRef());
  }

  const handleOtpChange = (value) => {
    const nextEmptyIndex = otp.findIndex((val) => val === "");

    if (nextEmptyIndex !== -1) {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[nextEmptyIndex] = value;
        return newOtp;
      });
    }
  };

  const clearOtp = () => {
    setOtp(Array(8).fill(""));
  };

  useEffect(() => {
    const lastFilledIndex = otp.findIndex((val) => val === "");
    if (lastFilledIndex !== -1 && otpRefs.current[lastFilledIndex].current) {
      otpRefs.current[lastFilledIndex].current.focus();
    } else if (lastFilledIndex === -1) {
      handleSubmit();
    }
  }, [otp]);

  const handleSubmit = async () => {
    let pin = otp.join("");
    console.log("OTP Submitted:", pin);
    try {
      const pinReceipt = await ElectionInstance.methods
        .validatePIN(pin)
        .send({ from: admin, gas: 600000 });

      if (pinReceipt.status) {
        unlockVote();
      } else {
        alert.error(
          <div>
            ඔබ ඇතුලත් කල අංකය වැරදී! <br /> <br />
            நீங்கள் உள்ளிட்ட எண் தவறானது!
            <br /> <br />
            Invalid PIN!
          </div>
        );
        clearOtp();
      }
    } catch {
      alert.error(
        <div>
          ඔබ ඇතුලත් කල අංකය වැරදී! <br /> <br />
          நீங்கள் உள்ளிட்ட எண் தவறானது!
          <br /> <br />
          Invalid PIN!
        </div>
      );
      clearOtp();
    }
  };

  return (
    <div className="otpContainer">
      {[
        "ඔබ සතුව ඇති රහස් අංකය ඇතුලත් කරන්න",
        "உங்களிடம் உள்ள ரகசிய எண்ணை உள்ளிடவும்",
        "Enter your PIN",
      ].map((title, index) => (
        <h1 key={index} className="otpTitle">
          {title}
        </h1>
      ))}
      <br />
      <div className="otpInputContainer">
        {otp.map((_, index) => (
          <input
            key={index}
            type="text"
            className="otpBox"
            maxLength={1}
            ref={otpRefs.current[index]}
            value={otp[index]}
            readOnly
          />
        ))}
      </div>
      <div className="numberPad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "Clear", 0, ""].map((num, index) => (
          <button
            key={index}
            className="numberPadButton"
            onClick={() =>
              num === "Clear" ? clearOtp() : handleOtpChange(num.toString())
            }
          >
            {num === "Clear" ? (
              <>
                <span>මකන්න</span>
                <span>Clear</span>
              </>
            ) : (
              num
            )}
          </button> //මකන්න
        ))}
      </div>
    </div>
  );
}
