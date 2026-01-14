"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Tour {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  highlights?: string[];
  itinerary?: string[];
  included?: string[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"carousel" | "tours" | "add-tour" | "security">("carousel");
  
  const [newTour, setNewTour] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    image: "",
    highlights: "",
    itinerary: "",
    included: ""
  });

  const [editingTour, setEditingTour] = useState<{
    id: number;
    title: string;
    description: string;
    price: string;
    duration: string;
    image: string;
    highlights: string;
    itinerary: string;
    included: string;
  } | null>(null);

  const [carouselImages, setCarouselImages] = useState([
    { id: 1, url: "", title: "", description: "" },
    { id: 2, url: "", title: "", description: "" },
    { id: 3, url: "", title: "", description: "" },
    { id: 4, url: "", title: "", description: "" },
  ]);

  const [tourImages, setTourImages] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchTours();
    fetchCarousel();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours');
      if (response.ok) {
        const data = await response.json();
        setTours(data);
      }
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    }
  };

  const fetchCarousel = async () => {
    try {
      const res = await fetch('/api/carousel');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCarouselImages(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch carousel images:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (data.success) {
        const fullUrl = data.url.startsWith('http') ? data.url : window.location.origin + data.url;
        setUploadedImage(fullUrl);
        alert(`이미지 업로드 성공!\nURL: ${fullUrl}`);
      } else {
        alert(`업로드 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleCarouselImageUpdate = (index: number, field: "url" | "title" | "description", value: string) => {
    const updated = [...carouselImages];
    updated[index] = { ...updated[index], [field]: value };
    setCarouselImages(updated);
  };

  const handleCarouselTourSelect = (index: number, tourId: string) => {
    if (!tourId) return;
    const tour = tours.find(t => t.id === parseInt(tourId));
    if (tour) {
      const updated = [...carouselImages];
      updated[index] = {
        ...updated[index],
        url: tour.image,
        title: tour.title,
        description: tour.description
      };
      setCarouselImages(updated);
    }
  };

  const handleSaveCarousel = async () => {
    try {
      const res = await fetch('/api/carousel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carouselImages),
      });
      if (res.ok) {
        alert('캐러셀 이미지가 저장되었습니다.');
      } else {
        alert('캐러셀 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save carousel error:', error);
      alert('캐러셀 저장 중 오류가 발생했습니다.');
    }
  };

  const handleTourImageUpdate = (tourId: number, imageUrl: string) => {
    setTourImages({ ...tourImages, [tourId]: imageUrl });
  };

  const handleSaveTourImage = async (tourId: number) => {
    const imageUrl = tourImages[tourId];
    if (!imageUrl) {
      alert('이미지 URL을 입력하세요.');
      return;
    }
    try {
      const res = await fetch(`/api/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }),
      });
      if (res.ok) {
        alert('투어 이미지가 저장되었습니다.');
        fetchTours();
      } else {
        alert('투어 이미지 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save tour image error:', error);
      alert('투어 이미지 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteTour = async (tourId: number) => {
    if (!confirm("정말로 이 투어를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/tours/${tourId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('투어가 삭제되었습니다.');
        fetchTours();
      } else {
        alert('투어 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete tour error:', error);
      alert('투어 삭제 중 오류가 발생했습니다.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("URL이 클립보드에 복사되었습니다!");
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleAddTour = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tourData = {
        ...newTour,
        price: Number(newTour.price),
        highlights: newTour.highlights.split('\n').filter(Boolean),
        itinerary: newTour.itinerary.split('\n').filter(Boolean),
        included: newTour.included.split('\n').filter(Boolean),
      };
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tourData),
      });
      if (response.ok) {
        alert('Tour added successfully!');
        setNewTour({ title: "", description: "", price: "", duration: "", image: "", highlights: "", itinerary: "", included: "" });
        fetchTours();
        setActiveTab("tours");
      } else {
        alert('Failed to add tour');
      }
    } catch (error) {
      console.error('Error adding tour:', error);
      alert('Error adding tour');
    }
  };

  const handleUpdateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;
    try {
      const updatedData = {
        title: editingTour.title,
        description: editingTour.description,
        price: Number(editingTour.price),
        duration: editingTour.duration,
        image: editingTour.image,
        highlights: editingTour.highlights.split('\n').filter(Boolean),
        itinerary: editingTour.itinerary.split('\n').filter(Boolean),
        included: editingTour.included.split('\n').filter(Boolean),
      };
      const res = await fetch(`/api/tours/${editingTour.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        alert('투어가 업데이트되었습니다.');
        setEditingTour(null);
        fetchTours();
      } else {
        alert('투어 업데이트 실패');
      }
    } catch (error) {
      console.error('Update tour error:', error);
      alert('투어 업데이트 중 오류가 발생했습니다.');
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호와 확인이 일치하지 않습니다.");
      return;
    }
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        alert("비밀번호가 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`비밀번호 변경 실패: ${err.error || "오류가 발생했습니다."}`);
      }
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            로그아웃
          </button>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab("carousel")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "carousel" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              캐러셀 이미지
            </button>
            <button onClick={() => setActiveTab("tours")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "tours" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              투어 목록
            </button>
            <button onClick={() => setActiveTab("add-tour")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "add-tour" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              투어 추가
            </button>
            <button onClick={() => setActiveTab("security")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "security" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              보안 설정
            </button>
          </nav>
        </div>

        {activeTab === "carousel" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">캐러셀 이미지 관리</h2>
            <div className="space-y-6">
              {carouselImages.map((image, index) => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">투어에서 불러오기</label>
                    <select value="" onChange={(e) => handleCarouselTourSelect(index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="">투어 선택</option>
                      {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                      <input type="text" value={image.url} onChange={(e) => handleCarouselImageUpdate(index, "url", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                      <input type="text" value={image.title} onChange={(e) => handleCarouselImageUpdate(index, "title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                      <textarea value={image.description} onChange={(e) => handleCarouselImageUpdate(index, "description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <div>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm" />
                  {uploadedImage && <p className="text-sm mt-2">업로드된 이미지 URL: {uploadedImage}</p>}
                </div>
                <button onClick={handleSaveCarousel} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">변경사항 저장</button>
              </div>
              {uploading && <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}
            </div>
          </div>
        )}

        {activeTab === "tours" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">투어 이미지 관리</h2>
            <div className="space-y-6">
              {tours.map((tour) => {
                const imageUrl = tourImages[tour.id] || tour.image;
                return (
                  <div key={tour.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">{tour.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                        <input type="text" value={imageUrl} onChange={(e) => handleTourImageUpdate(tour.id, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="이미지 URL 입력" />
                      </div>
                      <div className="flex items-end gap-2">
                        <button onClick={() => copyToClipboard(imageUrl)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">URL 복사</button>
                        <button onClick={() => handleSaveTourImage(tour.id)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">저장</button>
                        <button onClick={() => handleDeleteTour(tour.id)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">삭제</button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <img src={imageUrl} alt={tour.title} className="w-full h-48 object-cover rounded-md" />
                    </div>
                    <div className="mt-4">
                      <button onClick={() => setEditingTour({
                        id: tour.id, title: tour.title, description: tour.description,
                        price: String(tour.price), duration: tour.duration, image: tour.image,
                        highlights: (tour.highlights || []).join('\n'),
                        itinerary: (tour.itinerary || []).join('\n'),
                        included: (tour.included || []).join('\n'),
                      })} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">세부정보 수정</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {editingTour && (
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">투어 수정</h3>
                <form onSubmit={handleUpdateTour} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">투어 제목</label>
                      <input value={editingTour.title} onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                      <input value={editingTour.price} onChange={(e) => setEditingTour({ ...editingTour, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">기간</label>
                      <input value={editingTour.duration} onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                      <input value={editingTour.image} onChange={(e) => setEditingTour({ ...editingTour, image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                      <textarea value={editingTour.description} onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">하이라이트</label>
                      <textarea value={editingTour.highlights} onChange={(e) => setEditingTour({ ...editingTour, highlights: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">일정</label>
                      <textarea value={editingTour.itinerary} onChange={(e) => setEditingTour({ ...editingTour, itinerary: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">포함사항</label>
                      <textarea value={editingTour.included} onChange={(e) => setEditingTour({ ...editingTour, included: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
                    <button type="button" onClick={() => setEditingTour(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "add-tour" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">투어 추가</h2>
            <form onSubmit={handleAddTour} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="투어 제목" value={newTour.title} onChange={(e) => setNewTour({ ...newTour, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input placeholder="가격" value={newTour.price} onChange={(e) => setNewTour({ ...newTour, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input placeholder="기간" value={newTour.duration} onChange={(e) => setNewTour({ ...newTour, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input placeholder="이미지 URL" value={newTour.image} onChange={(e) => setNewTour({ ...newTour, image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <textarea placeholder="설명" value={newTour.description} onChange={(e) => setNewTour({ ...newTour, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
              <textarea placeholder="하이라이트 (줄바꿈으로 항목 구분)" value={newTour.highlights} onChange={(e) => setNewTour({ ...newTour, highlights: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
              <textarea placeholder="일정 (줄바꿈으로 항목 구분)" value={newTour.itinerary} onChange={(e) => setNewTour({ ...newTour, itinerary: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
              <textarea placeholder="포함사항 (줄바꿈으로 항목 구분)" value={newTour.included} onChange={(e) => setNewTour({ ...newTour, included: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">추가</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">보안 설정</h2>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">비밀번호 변경</button>
              </div>
            </form>
            <p className="text-sm text-gray-500 mt-4">변경된 비밀번호는 데이터베이스에 안전하게 저장됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

