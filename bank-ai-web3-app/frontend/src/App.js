import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// 导入组件
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Transfer from './components/Transactions/Transfer';
import TransactionHistory from './components/Transactions/TransactionHistory';
import AddNewTransaction from './components/Transactions/AddNewTransaction';
import FinancialHealth from './components/FinancialHealth';
import AIChatbot from './components/AI/Chatbot';
import PrivateRoute from './components/Auth/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* 全局提示组件 */}
          <ToastContainer 
            position="top-right" 
            autoClose={3000}
            theme="colored"
            closeOnClick
            pauseOnHover
          />
          
          {/* 路由配置 */}
          <Routes>
            {/* 公开路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 私有路由 - 带布局 */}
            <Route element={<Layout />}>
              <Route path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/transfer" element={
                <PrivateRoute>
                  <Transfer />
                </PrivateRoute>
              } />

              <Route path="/transactions" element={
                <PrivateRoute>
                  <TransactionHistory />
                </PrivateRoute>
              } />
            
              <Route path="/add" element={
                <PrivateRoute>
                  <AddNewTransaction />
                </PrivateRoute>
              } />
            
              <Route path="/financial-health" element={
                <PrivateRoute>
                  <FinancialHealth />
                </PrivateRoute>
              } />

              <Route path="/ai/chat" element={
                <PrivateRoute>
                  <AIChatbot />
                </PrivateRoute>
              } />
            </Route>
            
            {/* 404重定向到首页 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
