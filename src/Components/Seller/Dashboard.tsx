// Dashboard.tsx - Updated
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  User, Phone, Lock, Eye, EyeOff, CheckCircle, 
  XCircle, Upload, Edit2,
   DollarSign, Package, Users,
   ShoppingBag
} from 'lucide-react';
import axios from 'axios';
import { baseurl } from '../../Constant/Base';
import { useGetToken } from '../../Token/getToken';
import ExtractToken from '../../Token/Extract';
import { toast } from 'react-hot-toast';
import { SellerLayout } from './SellerLayout';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserData {
  name: string;
  email: string;
  INR: string;
  DXB: string;
  status: boolean;
  Image: string;
}

interface EditForm {
  name: string;
  email: string;
  INR: string;
  DXB: string;
  status: boolean;
  Image: string;
}

interface ExtractTokenResult {
  userId: string;
}

const DashboardPage: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    INR: '',
    DXB: '',
    status: false,
    Image: ''
  });

  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    email: '',
    INR: '',
    DXB: '',
    status: false,
    Image: ''
  });

  const api = axios.create({ baseURL: baseurl });
  const token = useGetToken("sellerToken");
  const sellerId: ExtractTokenResult = ExtractToken(token) as ExtractTokenResult;

  const getSeller = async (): Promise<void> => {
    try {
      const response = await api.get(`/seller/profile/${sellerId.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
      setEditForm(response.data);
      if (response.data.Image) {
        setProfileImagePreview(response.data.Image);
      }
    } catch (error) {
      toast.error('Failed to fetch user data');
    }
  };

  const getDashboardStats = async (): Promise<void> => {
    try {
      const response = await api.get('/seller/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    getSeller();
    getDashboardStats();
  }, []);

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/seller/reset-password/${sellerId.userId}`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('email', userData.email);
      formData.append('INR', editForm.INR);
      formData.append('DXB', editForm.DXB);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      const response = await api.put(`/seller/update-profile/${sellerId.userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        toast.success('Profile updated successfully');
        setUserData({
          ...editForm,
          email: userData.email,
          status: userData.status,
          Image: response.data.data.Image || userData.Image
        });
        if (response.data.data.Image) {
          setProfileImagePreview(response.data.data.Image);
        }
        setIsEditing(false);
        setProfileImage(null);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {title.includes('Sales') ? `₹${value.toLocaleString()}` : value.toLocaleString()}
          </h3>
        </div>
        <div className={`p-3 ${color} text-white rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <SellerLayout title="Dashboard" subtitle={`Welcome back, ${userData.name}!`}>
      <div className="flex items-center gap-4 mb-8">
        {userData.status ? (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Approved Seller</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Pending Approval</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Products" 
          value={dashboardStats.totalProducts} 
          icon={<Package size={24} />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Orders" 
          value={dashboardStats.totalOrders} 
          icon={<ShoppingBag size={24} />}
          color="bg-green-500"
        />
        <StatCard 
          title="Total Sales" 
          value={dashboardStats.totalSales} 
          icon={<DollarSign size={24} />}
          color="bg-purple-500"
        />
        <StatCard 
          title="Pending Orders" 
          value={dashboardStats.pendingOrders} 
          icon={<Users size={24} />}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <User className="h-5 w-5" />
                </div>
                <span>Profile Information</span>
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-4 border-white shadow">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <User size={48} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 shadow">
                      <Upload size={18} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={userData.email}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg opacity-70"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Indian Phone Number</label>
                    <div className="flex">
                      <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg">+91</span>
                      <input
                        type="tel"
                        value={editForm.INR}
                        onChange={(e) => setEditForm({ ...editForm, INR: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dubai Phone Number</label>
                    <div className="flex">
                      <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg">+971</span>
                      <input
                        type="tel"
                        value={editForm.DXB}
                        onChange={(e) => setEditForm({ ...editForm, DXB: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Updating Profile...' : 'Update Profile'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-4 bg-blue-50 rounded-lg">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border-4 border-white shadow">
                    {profileImagePreview ? (
                      <img 
                        src={profileImagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{userData.name}</h3>
                    <p className="text-gray-600 mt-1">{userData.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Indian Phone Number</p>
                      <p className="font-medium text-gray-800">{userData.INR || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dubai Phone Number</p>
                      <p className="font-medium text-gray-800">{userData.DXB || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <Lock className="h-5 w-5" />
              </div>
              <span>Reset Password</span>
            </h3>
          </div>
          
          <div className="pt-2">
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    required
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    required
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    required
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default DashboardPage;