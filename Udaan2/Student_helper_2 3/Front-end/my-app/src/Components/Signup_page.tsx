import { useNavigate } from 'react-router-dom';
import { AuthForm } from './AuthForm';
import { API, apiPost } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const SignupPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSignup = async (email: string, password: string) => {
    const data: any = await apiPost(API.SIGNUP, { email, password });
    login(data.user_id, data.email, data.access_token);
    showToast('Account created successfully!', 'success');
    navigate('/home');
  };

  return <AuthForm mode="signup" onSubmit={handleSignup} />;
};

export default SignupPage;
