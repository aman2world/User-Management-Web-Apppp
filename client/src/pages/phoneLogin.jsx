import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/UserSlice';

export default function PhoneLogin() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber) {
      return dispatch(signInFailure('Please enter your phone number'));
    }
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });
      
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setTimer(30);
        dispatch(signInSuccess(null));
      } else {
        dispatch(signInFailure(data.message));
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      return dispatch(signInFailure('Please enter the OTP'));
    }
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        dispatch(signInSuccess(data));
        navigate('/dashboard');
      } else {
        dispatch(signInFailure(data.message));
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleReset = () => {
    setFormData({ phoneNumber: '', otp: '' });
    setOtpSent(false);
    setTimer(0);
    dispatch(signInSuccess(null));
  };

  return (
    <div className='min-h-screen mt-20'>   
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        {/* LEFT */}
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-4xl'>
            <span className='px-2 py-1 bg-yellow-300 rounded-lg text-white'>
              Aman
            </span>
            .com
          </Link>
          <p className='text-sm mt-5'>
            Sign in with your phone number using OTP verification.
          </p>
        </div>

        {/* RIGHT */}
        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            <div>
              <Label value='Your phone number' />
              <TextInput
                type='tel'
                id='phoneNumber'
                placeholder='Enter your phone number'
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={otpSent}
              />
            </div>
            <div>
              <Label value='Enter OTP' />
              <TextInput
                type='text'
                id='otp'
                placeholder='Enter OTP'
                value={formData.otp}
                onChange={handleChange}
                disabled={!otpSent}
              />
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
            > 
              {loading ? (
                <>
                  <Spinner size='sm'/>
                  <span className='pl-3'>Loading...</span>
                </>
              ) : otpSent ? 'Verify OTP' : 'Send OTP'}
            </Button>
          </form>
          
          <div className='flex justify-between items-center text-sm mt-4'>
            <span className='text-gray-500'>
              {otpSent && timer > 0 ? `Resend in ${timer}s` : (
                <span 
                  className='text-blue-500 cursor-pointer' 
                  onClick={handleSendOtp}
                >
                  Resend
                </span>
              )}
            </span>
            <span 
              className='text-blue-500 cursor-pointer' 
              onClick={handleReset}
            >
              Reset
            </span>
          </div>

          <div className='flex justify-center items-center text-sm mt-4'>
            <span>Don't have an account?</span>
            <Link to='/register' className='text-blue-500 ml-2'>
              Register
            </Link>
          </div>

          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}