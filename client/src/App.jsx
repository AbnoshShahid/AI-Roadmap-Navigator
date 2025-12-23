import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Login from './components/Login';
import Register from './components/Register';
import CareerForm from './components/CareerForm';
import RoadmapResult from './components/RoadmapResult';
import RoadmapDashboard from './components/RoadmapDashboard';
import SkillsDashboard from './components/SkillsDashboard';
import Profile from './components/Profile';
import DashboardLayout from './components/DashboardLayout';
import ProgressTracker from './components/ProgressTracker';
import RoadmapTemplates from './components/RoadmapTemplates';
import { generateRoadmap, saveRoadmap } from './services/api';

// Protect Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Login/Register Wrapper for Redirects
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const navigate = useNavigate();
  // Roadmap State (Lifted up for Roadmap generation flow)
  const [roadmap, setRoadmap] = useState(null);
  const [lastFormData, setLastFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setLastFormData(formData);
    setAnalysis(null);
    try {
      const data = await generateRoadmap(formData);
      setRoadmap(data.roadmap);
      if (data.triggeredRules || data.reasoning || data.mlRecommendations || data.skillsAnalysis) {
        setAnalysis({
          triggeredRules: data.triggeredRules,
          reasoning: data.reasoning,
          mlRecommendations: data.mlRecommendations,
          skillsAnalysis: data.skillsAnalysis
        });
      }
      navigate('/app/roadmap/generated');
      toast.success('Roadmap generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate roadmap.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!roadmap || !lastFormData) return;
    const toastId = toast.loading('Saving roadmap...');
    try {
      await saveRoadmap({
        userSummary: {
          role: lastFormData.role,
          education: lastFormData.education,
          currentSkills: lastFormData.skills.join(', '),
          interests: lastFormData.interests
        },
        jobSuggestions: analysis.mlRecommendations?.map(rec => ({
          title: rec.role,
          description: `Confidence: ${(rec.confidence * 100).toFixed(0)}%`
        })) || [],
        skillsAnalysis: {
          requiredSkills: [],
          existingSkills: lastFormData.skills,
          missingSkills: analysis.skillsAnalysis?.missingSkills?.map(s => s.skill) || [],
          matchPercentage: analysis.skillsAnalysis?.matchScore || 0
        },
        roadmap
      });
      toast.success('Roadmap saved!', { id: toastId });
      navigate('/app/saved-roadmaps');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save roadmap.', { id: toastId });
    }
  };

  const handleViewRoadmap = (item) => {
    setRoadmap(item);
    setAnalysis({
      triggeredRules: item.triggeredRules,
      reasoning: item.reasoning,
      mlRecommendations: item.mlRecommendations,
      skillsAnalysis: item.skillsAnalysis
    });
    navigate('/app/progress'); // Or specific ID if backend supports it
  };

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login onSwitchToRegister={() => navigate('/register')} />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register onSwitchToLogin={() => navigate('/login')} />
        </PublicRoute>
      } />

      {/* Protected App Routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={
          <RoadmapDashboard
            onViewRoadmap={handleViewRoadmap}
            onCreateNew={() => navigate('/app/templates')}
            onlyActive={true}
          />
        } />
        <Route path="saved-roadmaps" element={
          <RoadmapDashboard
            onViewRoadmap={handleViewRoadmap}
            onCreateNew={() => navigate('/app/templates')}
            onlyActive={false}
          />
        } />
        <Route path="templates" element={
          <RoadmapTemplates onTemplateAdded={() => navigate('/app/saved-roadmaps')} />
        } />
        <Route path="create" element={
          <CareerForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        } />
        <Route path="skills" element={<SkillsDashboard />} />
        <Route path="profile" element={<Profile />} />

        {/* Result/Progress Views */}
        <Route path="roadmap/generated" element={
          roadmap ? (
            <RoadmapResult
              roadmap={roadmap}
              analysis={analysis}
              onReset={() => {
                setRoadmap(null);
                setAnalysis(null);
                navigate('/app/create');
              }}
              onSave={handleSave}
            />
          ) : <Navigate to="/app/create" />
        } />
        <Route path="progress" element={
          roadmap ? (
            <ProgressTracker
              roadmap={roadmap}
              onBack={() => navigate('/app/saved-roadmaps')}
            />
          ) : <Navigate to="/app/saved-roadmaps" />
        } />
      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
