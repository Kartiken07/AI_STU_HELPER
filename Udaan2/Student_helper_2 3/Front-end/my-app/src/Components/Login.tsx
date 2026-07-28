import { useNavigate } from 'react-router-dom';
import { AuthForm } from './AuthForm';
import { API, apiPost } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    const data: any = await apiPost(API.LOGIN, { email, password });
    login(data.user_id, data.email, data.access_token);
    showToast('Signed in successfully', 'success');
    navigate('/home');
  };

  return <AuthForm mode="login" onSubmit={handleLogin} />;
};

export default LoginPage;
