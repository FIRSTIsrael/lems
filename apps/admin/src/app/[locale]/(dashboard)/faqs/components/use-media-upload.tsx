import { useState } from 'react';
import { apiFetch } from '@lems/shared';
import { useTranslations } from 'next-intl';

interface UseMediaUploadProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onAnswerChange: (html: string) => void;
  restoreSelection: () => void;
}

export function useMediaUpload({
  editorRef,
  onAnswerChange,
  restoreSelection
}: UseMediaUploadProps) {
  const t = useTranslations('pages.faqs.editor');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDeleteLink = (type: 'image' | 'video', onDelete: () => void) => {
    const deleteLink = document.createElement('a');
    deleteLink.innerHTML = `🗑️ ${t(`toolbar.delete-${type}`)}`;
    deleteLink.href = '#';
    deleteLink.className = 'media-delete-link';

    Object.assign(deleteLink.style, {
      display: 'block',
      marginTop: '4px',
      fontSize: '12px',
      color: '#d32f2f',
      textDecoration: 'none',
      cursor: 'pointer',
      opacity: '0',
      transition: 'opacity 0.2s'
    });

    deleteLink.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(t(`toolbar.confirm-delete-${type}`))) {
        onDelete();
      }
    };

    return deleteLink;
  };

  const insertMediaElement = (
    element: HTMLImageElement | HTMLVideoElement,
    type: 'image' | 'video'
  ) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    restoreSelection();

    const wrapper = document.createElement('div');
    wrapper.className = 'media-wrapper';
    Object.assign(wrapper.style, {
      display: 'inline-block',
      maxWidth: '100%',
      margin: '16px 0',
      padding: '8px',
      border: '1px solid transparent',
      borderRadius: '4px',
      transition: 'border-color 0.2s'
    });

    Object.assign(element.style, {
      maxWidth: '100%',
      height: 'auto',
      display: 'block',
      borderRadius: '4px'
    });

    const deleteLink = createDeleteLink(type, () => {
      wrapper.remove();
      onAnswerChange(editorRef.current?.innerHTML ?? '');
    });

    // Show delete link on hover
    wrapper.onmouseenter = () => {
      wrapper.style.borderColor = '#e0e0e0';
      deleteLink.style.opacity = '1';
    };

    wrapper.onmouseleave = () => {
      wrapper.style.borderColor = 'transparent';
      deleteLink.style.opacity = '0';
    };

    wrapper.appendChild(element);
    wrapper.appendChild(deleteLink);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(wrapper);

      const br = document.createElement('br');
      range.collapse(false);
      range.insertNode(br);

      range.setStartAfter(br);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current.appendChild(wrapper);
      const br = document.createElement('br');
      editorRef.current.appendChild(br);
    }

    onAnswerChange(editorRef.current.innerHTML);
  };

  const handleImageUpload = async (file: File) => {
    if (
      !file.type.startsWith('image/') ||
      (!file.name.endsWith('.jpg') && !file.name.endsWith('.jpeg') && !file.name.endsWith('.png'))
    ) {
      setError(t('errors.invalid-image-type'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(t('errors.image-too-large'));
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await apiFetch('/admin/faqs/upload-image', {
        method: 'POST',
        body: formData
      });

      if (result.ok) {
        const imageUrl = (result.data as { url: string }).url;
        const img = document.createElement('img');
        img.src = imageUrl;
        insertMediaElement(img, 'image');
      } else {
        setError(t('errors.image-upload-failed'));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(t('errors.image-upload-failed'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (
      !file.type.startsWith('video/') ||
      (!file.name.endsWith('.mp4') && !file.name.endsWith('.webm'))
    ) {
      setError(t('errors.invalid-video-type'));
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError(t('errors.video-too-large'));
      return;
    }

    setIsUploadingVideo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const result = await apiFetch('/admin/faqs/upload-video', {
        method: 'POST',
        body: formData
      });

      if (result.ok) {
        const videoUrl = (result.data as { url: string }).url;
        const video = document.createElement('video');
        video.src = videoUrl;
        video.controls = true;
        insertMediaElement(video, 'video');
      } else {
        setError(t('errors.video-upload-failed'));
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      setError(t('errors.video-upload-failed'));
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleMediaUpload = async (file: File) => {
    if (file.type.startsWith('video/')) {
      await handleVideoUpload(file);
    } else {
      await handleImageUpload(file);
    }
  };

  return {
    isUploadingImage,
    isUploadingVideo,
    error,
    setError,
    handleMediaUpload
  };
}
