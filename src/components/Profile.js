import React, { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEdit } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [user, setUser ] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [additionalDetails, setAdditionalDetails] = useState({
    achievements: "",
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
    age: "",
    sport: "",
    matchesPlayed: 0,
    goalsScored: 0,
    assists: 0,
    fitnessLevel: "",
    experience: "",
    teamsManaged: "",
    certifications: "",
  });
  const [editMode, setEditMode] = useState({
    facebook: false,
    twitter: false,
    linkedin: false,
    instagram: false,
  });
  const [completion, setCompletion] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser  = auth.currentUser ;
      if (currentUser ) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser (userData);
          setName(userData.name);
          setAdditionalDetails({
            achievements: userData.additionalDetails?.achievements || "",
            socialLinks: userData.additionalDetails?.socialLinks || {
              facebook: "", twitter: "", linkedin: "", instagram: ""
            },
            age: userData.additionalDetails?.age || "",
            sport: userData.additionalDetails?.sport || "",
            matchesPlayed: userData.additionalDetails?.matchesPlayed || 0,
            goalsScored: userData.additionalDetails?.goalsScored || 0,
            assists: userData.additionalDetails?.assists || 0,
            fitnessLevel: userData.additionalDetails?.fitnessLevel || "",
            experience: userData.additionalDetails?.experience || "",
            teamsManaged: userData.additionalDetails?.teamsManaged || "",
            certifications: userData.additionalDetails?.certifications || "",
          });
          calculateProgress(userData);
        }
      }
      setLoading(false);
    };
    fetchUserProfile();
  }, []);

  const calculateProgress = (userData) => {
    let totalFields = userData.role === "athlete" ? 15 : 10; // Updated total fields
    let filledFields = 0;
    const fieldsToCheck = [
      userData.name,
      userData.additionalDetails?.achievements,
      ...(userData.role === "athlete" ? [
        userData.additionalDetails?.age,
        userData.additionalDetails?.sport,
        userData.additionalDetails?.matchesPlayed,
        userData.additionalDetails?.goalsScored,
        userData.additionalDetails?.assists,
        userData.additionalDetails?.fitnessLevel
      ] : [
        userData.additionalDetails?.experience,
        userData.additionalDetails?.teamsManaged,
        userData.additionalDetails?.certifications
      ])
    ];
    filledFields = fieldsToCheck.filter(field => Boolean(field)).length;
    const socialMediaLinks = Object.values(userData.additionalDetails?.socialLinks || {}).filter(Boolean);
    if (socialMediaLinks.length > 0) filledFields++;
    setCompletion(Math.round((filledFields / totalFields) * 100));
  };

  const validateSocialLink = (platform, url) => {
    const patterns = {
      facebook: /^(https?:\/\/)?(www\.)?facebook.com\/.+/,
      twitter: /^(https?:\/\/)?(www\.)?twitter.com\/.+/,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin.com\/.+/,
      instagram: /^(https?:\/\/)?(www\.)?instagram.com\/.+/
    };
    return patterns[platform].test(url);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      // Validate social links before saving
      const invalidLinks = Object.entries(additionalDetails.socialLinks)
        .filter(([platform, url]) => url && !validateSocialLink(platform, url));

      if (invalidLinks.length > 0) {
        toast.error(`Invalid ${invalidLinks[0][0]} URL format!`);
        return;
      }

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name,
        additionalDetails,
      });
      setEditMode({ facebook: false, twitter: false, linkedin: false, instagram: false });
      calculateProgress({ ...user, name, additionalDetails });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        draft: {
          name,
          additionalDetails,
          savedAt: new Date()
        }
      });
      toast.info("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft.");
    }
  };

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Profile Preview</h2>
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-gray-600">{user?.email}</p>
        <p className="text-gray-600 mb-4">{user?.role}</p>
        <p className="mb-4">{additionalDetails.achievements}</p>
        <div className="flex space-x-4">
          {Object.entries(additionalDetails.socialLinks).map(([platform, url]) => (
            url && (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-2xl">
                {platform === "facebook" && <FaFacebook className="text-blue-600" />}
                {platform === "twitter" && <FaTwitter className="text-blue-400" />}
                {platform === "linkedin" && <FaLinkedin className="text-blue-700" />}
                {platform === "instagram" && <FaInstagram className="text-pink-500" />}
              </a>
            )
          ))}
        </div>
        <button
          onClick={() => setShowPreview(false)}
          className="mt-4 w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close Preview
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <ToastContainer position="bottom-right" autoClose={3000} />
      {showPreview && <PreviewModal />}

      <h1 className="text-2xl font-bold text-center mb-4">Profile</h1>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Profile Completion: {completion}%</span>
          {completion < 100 && (
            <span className="text-sm text-red-500">
              Complete {100 - completion}% more to finish!
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded h-3">
          <div
            className="bg-blue-500 h-3 rounded transition-all duration-300"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Your Name"
          />
          {!name && (
            <p className="text-red-500 text-sm mt-1">Name is required for profile completion</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Achievements</label>
          <textarea
            value={additionalDetails.achievements}
            onChange={(e) => setAdditionalDetails(prev => ({
              ...prev,
              achievements: e.target.value
            }))}
            className="w-full border p-2 rounded"
            placeholder="Your Achievements"
          />
        </div>

        {/* New Fields for Athlete */}
        {user?.role === "athlete" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                value={additionalDetails.age}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  age: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Your Age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sport</label>
              <input
                type="text"
                value={additionalDetails.sport}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  sport: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Your Sport"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Matches Played</label>
              <input
                type="number"
                value={additionalDetails.matchesPlayed}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  matchesPlayed: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Matches Played"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Goals Scored</label>
              <input
                type="number"
                value={additionalDetails.goalsScored}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  goalsScored: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Goals Scored"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assists</label>
              <input
                type="number"
                value={additionalDetails.assists}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  assists: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Assists"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fitness Level</label>
              <input
                type="text"
                value={additionalDetails.fitnessLevel}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  fitnessLevel: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Your Fitness Level"
              />
            </div>
          </>
        )}

        {/* New Fields for Coach */}
        {user?.role === "coach" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <input
                type="text"
                value={additionalDetails.experience}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  experience: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Your Experience"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teams Managed</label>
              <input
                type="text"
                value={additionalDetails.teamsManaged}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  teamsManaged: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Teams Managed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Certifications</label>
              <input
                type="text"
                value={additionalDetails.certifications}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  certifications: e.target.value
                }))}
                className="w-full border p-2 rounded"
                placeholder="Your Certifications"
              />
            </div>
          </>
        )}

        {/* Social Links */}
        {Object.entries(additionalDetails.socialLinks).map(([platform, url]) => (
          <div key={platform}>
            <label className="block text-sm font-medium mb-1">{platform.charAt(0).toUpperCase() + platform.slice(1)} Link</label>
            <div className="flex items-center">
              <input
                type="url"
                value={url}
                onChange={(e) => setAdditionalDetails(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                }))}
                className={`flex-grow border p-2 rounded ${editMode[platform] ? '' : 'bg-gray-200'}`}
                placeholder={`Your ${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                readOnly={!editMode[platform]}
              />
              <button
                onClick={() => setEditMode(prev => ({ ...prev, [platform]: !prev[platform] }))}
                className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                aria-label={`Edit ${platform} link`}
              >
                <FaEdit />
              </button>
            </ div>
            {!validateSocialLink(platform, url) && url && (
              <p className="text-red-500 text-sm mt-1">Invalid {platform} URL format!</p>
            )}
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button
            onClick={handleUpdateProfile}
            className="py-2 px-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Update Profile
          </button>
          <button
            onClick={handleSaveDraft}
            className="py-2 px-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Save as Draft
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="py-2 px-3 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Preview Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;