"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { HiCamera } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import Modal from "../ui/Modal";
import CameraOverlay from "../ui/CameraOverlay";
import axios from 'axios';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; bio: string; profileImage?: string; coverImage?: string }) => void;
  initialValues: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    coverImage?: string;
  };
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialValues }: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setName(initialValues.name || '');
        setBio(initialValues.bio || '');
        setProfileImage(initialValues.avatarUrl || '');
        setCoverImage(initialValues.coverImage || '');
      }, 0);
    }
  }, [isOpen, initialValues.name, initialValues.bio, initialValues.avatarUrl, initialValues.coverImage]);

  const handleClose = () => {
    setName(initialValues.name || '');
    setBio(initialValues.bio || '');
    setProfileImage(initialValues.avatarUrl || '');
    setCoverImage(initialValues.coverImage || '');
    onClose();
  };

  const uploadFile = async (file: File, type: 'profile' | 'cover') => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await axios.post('/api/upload', formData);
      return response.data.url;
    } catch (error) {
      toast.error('Upload failed');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file, 'profile');
        setProfileImage(url);
      } catch (error) {
        console.error('Profile image upload failed:', error);
      }
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file, 'cover');
        setCoverImage(url);
      } catch (error) {
        console.error('Cover image upload failed:', error);
      }
    }
  };

  const handleSave = () => {
    onSave({ name, bio, profileImage, coverImage });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="w-full max-w-lg mx-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center p-4">
          <button
            onClick={handleClose}
            className="text-white text-xl hover:bg-neutral-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors mr-4"
          >
            <IoClose size={20} />
          </button>
          <h2 className="text-white text-xl font-bold flex-1">Edit profile</h2>
          <button
            className="bg-white text-black rounded-full px-4 py-1.5 font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
            onClick={handleSave}
            disabled={uploading}
          >
            Save
          </button>
        </div>

        {/* Cover Image */}
        <div className="relative h-48 bg-black mx-4 rounded-lg overflow-hidden">
          {coverImage && (
            <Image
              src={coverImage}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="hidden"
            id="cover-upload"
            disabled={uploading}
          />
          
          <label
            htmlFor="cover-upload"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -ml-6 cursor-pointer"
          >
            <CameraOverlay>
              <HiCamera className="text-white text-xl" />
            </CameraOverlay>
          </label>

          {coverImage && (
            <button
              onClick={() => setCoverImage('')}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ml-6"
            >
              <CameraOverlay>
                <IoClose className="text-white text-xl" />
              </CameraOverlay>
            </button>
          )}
        </div>

        {/* Profile Image */}
        <div className="flex justify-start px-4 -mt-16 mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
              id="profile-upload"
              disabled={uploading}
            />
            <label
              htmlFor="profile-upload"
              className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer transition-colors group"
            >
              <CameraOverlay size="sm" className="group-hover:bg-opacity-80">
                <HiCamera className="text-white text-lg" />
              </CameraOverlay>
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-4 pb-6 space-y-6">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.slice(0, 50))}
              placeholder=" "
              className="w-full bg-transparent text-white p-4 pt-6 border border-neutral-600 rounded focus:border-sky-500 focus:outline-none peer text-lg"
            />
            <label className="absolute left-4 top-2 text-neutral-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-placeholder-shown:text-neutral-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-sky-500">
              Name
            </label>
            <div className="absolute right-4 top-2 text-neutral-500 text-sm">
              {name.length}/50
            </div>
          </div>

          <div className="relative">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 160))}
              placeholder=" "
              className="w-full bg-transparent text-white p-4 pt-6 border border-neutral-600 rounded focus:border-sky-500 focus:outline-none resize-none peer text-lg"
              rows={3}
            />
            <label className="absolute left-4 top-2 text-sky-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-placeholder-shown:text-neutral-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-sky-500">
              Bio
            </label>
            <div className="absolute right-4 top-2 text-neutral-500 text-sm">
              {bio.length}/160
            </div>
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white">Uploading...</div>
          </div>
        )}
    </Modal>
  );
}
