import React, { useState, useCallback } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Committee } from '../types';
import { Area } from 'react-easy-crop';
import Swal from 'sweetalert2';

export const useCommittee = (committee: Committee[]) => {
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesignation, setNewCommDesignation] = useState('');
  const [newCommRemark, setNewCommRemark] = useState('');
  const [newCommPhoto, setNewCommPhoto] = useState('');
  const [isCommPhotoUploading, setIsCommPhotoUploading] = useState(false);
  const [editingCommMemberId, setEditingCommMemberId] = useState<string | null>(null);
  const [commSearchQuery, setCommSearchQuery] = useState('');
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  
  const handleAddOrEditCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName || !newCommDesignation) {
      Swal.fire({
        icon: 'warning',
        title: 'আবশ্যক!',
        text: 'নাম ও পদবী আবশ্যক!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      if (editingCommMemberId) {
        const memberRef = doc(db, 'committee', editingCommMemberId);
        await updateDoc(memberRef, {
          name: newCommName,
          designation: newCommDesignation,
          remark: newCommRemark,
          photo: newCommPhoto || ''
        });
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'কমিটি সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে!',
          timer: 2000,
          showConfirmButton: false
        });
        setEditingCommMemberId(null);
      } else {
        const memberId = `member_${Date.now()}`;
        await setDoc(doc(db, 'committee', memberId), {
          memberId,
          name: newCommName,
          designation: newCommDesignation,
          remark: newCommRemark,
          photo: newCommPhoto || ''
        });
        Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'কমিটি সদস্য সফলভাবে যুক্ত করা হয়েছে!',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setNewCommName('');
      setNewCommDesignation('');
      setNewCommRemark('');
      setNewCommPhoto('');
      setIsCommModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।',
      });
    }
  };

  const handleEditCommitteeStart = (member: Committee) => {
    setEditingCommMemberId(member.memberId);
    setNewCommName(member.name);
    setNewCommDesignation(member.designation);
    setNewCommRemark(member.remark || '');
    setNewCommPhoto(member.photo || '');
    setIsCommModalOpen(true);
  };

  const handleCancelCommitteeEdit = () => {
    setEditingCommMemberId(null);
    setNewCommName('');
    setNewCommDesignation('');
    setNewCommRemark('');
    setNewCommPhoto('');
    setIsCommModalOpen(false);
  };

  const handleDeleteCommittee = async (memberId: string) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "আপনি কি নিশ্চিতভাবে এই কমিটি সদস্যকে ডিলিট করতে চান?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
      cancelButtonText: 'না'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'committee', memberId));
        Swal.fire(
          'ডিলিট করা হয়েছে!',
          'কমিটি সদস্য সফলভাবে ডিলিট করা হয়েছে!',
          'success'
        );
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি!',
          text: 'ডিলিট করতে সমস্যা হয়েছে।',
        });
      }
    }
  };

  return {
    newCommName, setNewCommName,
    newCommDesignation, setNewCommDesignation,
    newCommRemark, setNewCommRemark,
    newCommPhoto, setNewCommPhoto,
    isCommPhotoUploading, setIsCommPhotoUploading,
    editingCommMemberId, setEditingCommMemberId,
    commSearchQuery, setCommSearchQuery,
    isCommModalOpen, setIsCommModalOpen,
    imageToCrop, setImageToCrop,
    isCropModalOpen, setIsCropModalOpen,
    handleAddOrEditCommittee,
    handleEditCommitteeStart,
    handleCancelCommitteeEdit,
    handleDeleteCommittee
  };
};
