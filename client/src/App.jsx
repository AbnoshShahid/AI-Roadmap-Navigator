import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Sidebar from './components/Sidebar';
import CareerForm from './components/CareerForm';
import RoadmapResult from './components/RoadmapResult';
import RoadmapDashboard from './components/RoadmapDashboard';
import SkillsDashboard from './components/SkillsDashboard';
import Profile from './components/Profile';
import DashboardLayout from './components/DashboardLayout';
import ProgressTracker from './components/ProgressTracker';
import RoadmapTemplates from './components/RoadmapTemplates';
import { generateRoadmap, saveRoadmap } from './services/api';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [view, setView] = useState('dashboard'); // 'dashboard', 'form', 'roadmap', 'skills', 'profile'

  // Roadmap State
  const [roadmap, setRoadmap] = useState(null);
  const [lastFormData, setLastFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Force view reset on logout is handled implicitly by unmounting

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return authView === 'login'
      ? <Login onSwitchToRegister={() => setAuthView('register')} />
      : <Register onSwitchToLogin={() => setAuthView('login')} />;
  }

  // Authenticated Logic
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
      setView('roadmap');
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
          currentSkills: lastFormData.skills.join(', '), // Convert array to string for legacy field
          interests: lastFormData.interests
        },
        jobSuggestions: analysis.mlRecommendations?.map(rec => ({
          title: rec.role,
          description: `Confidence: ${(rec.confidence * 100).toFixed(0)}%`
        })) || [],
        skillsAnalysis: {
          requiredSkills: [], // Not returned by backend yet, sending empty
          existingSkills: lastFormData.skills,
          missingSkills: analysis.skillsAnalysis?.missingSkills?.map(s => s.skill) || [], // Extract skill names
          matchPercentage: analysis.skillsAnalysis?.matchScore || 0
        },
        roadmap
      });
      toast.success('Roadmap saved!', { id: toastId });
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 503) {
        toast('Roadmap generated, but could not save (DB offline).', { icon: '⚠️', id: toastId });
      } else {
        toast.error('Failed to save roadmap.', { id: toastId });
      }
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
    setView('progress');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <RoadmapDashboard onViewRoadmap={handleViewRoadmap} onCreateNew={() => setView('templates')} onlyActive={true} />;
      case 'root':
        return <RoadmapDashboard onViewRoadmap={handleViewRoadmap} onCreateNew={() => setView('templates')} onlyActive={true} />;
      case 'saved_roadmaps':
        return <RoadmapDashboard onViewRoadmap={handleViewRoadmap} onCreateNew={() => setView('templates')} onlyActive={false} />;
      case 'templates':
        return <RoadmapTemplates onTemplateAdded={() => setView('saved_roadmaps')} />;
      case 'roadmaps':
        // Legacy redirect
        return <RoadmapDashboard onViewRoadmap={handleViewRoadmap} onCreateNew={() => setView('templates')} onlyActive={false} />;
      case 'form':
        return <CareerForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
      case 'progress':
        return roadmap ? (
          <ProgressTracker
            roadmap={roadmap}
            onBack={() => setView('saved_roadmaps')}
          />
        ) : <div className="text-center p-10">No roadmap loaded</div>;
      case 'roadmap':
        return roadmap ? (
          <RoadmapResult
            roadmap={roadmap}
            analysis={analysis}
            onReset={() => {
              setRoadmap(null);
              setAnalysis(null);
              setView('form');
            }}
            onSave={handleSave}
          />
        ) : <div className="text-center p-10">No roadmap loaded</div>;
      case 'skills':
        return <SkillsDashboard />;
      case 'profile':
        return <Profile />;
      default:
        // Transactions fallback or undefined routes
        return (
          <div className="p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">Coming Soon</h2>
            <p className="text-gray-500">The <strong>{view}</strong> module is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout view={view} setView={setView}>
      {renderContent()}
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
