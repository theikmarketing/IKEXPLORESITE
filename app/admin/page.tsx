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

export default function AdminPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"carousel" | "tours" | "add-tour">("carousel");
  
  // New Tour Form State
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

  // Edit Tour Form State
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

  // 캐러셀 이미지 관리
  const [carouselImages, setCarouselImages] = useState([
    { id: 1, url: "", title: "", description: "" },
    { id: 2, url: "", title: "", description: "" },
    { id: 3, url: "", title: "", description: "" },
    { id: 4, url: "", title: "", description: "" },
  ]);

  // 투어 이미지 관리
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

    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const fullUrl = data.url.startsWith('http') 
          ? data.url 
          : window.location.origin + data.url;
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
      const res = await fetch(`/api/tours/${tourId}`, {
        method: 'DELETE',
      });

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
        setNewTour({
          title: "", description: "", price: "", duration: "",
          image: "", highlights: "", itinerary: "", included: ""
        });
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

  const handleEditClick = (tour: Tour) => {
    setEditingTour({
      id: tour.id,
      title: tour.title,
      description: tour.description,
      price: tour.price.toString(),
      duration: tour.duration,
      image: tour.image,
      highlights: tour.highlights?.join('\n') || "",
      itinerary: tour.itinerary?.join('\n') || "",
      included: tour.included?.join('\n') || ""
    });
  };

  const handleUpdateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;

    try {
      const tourData = {
        ...editingTour,
        price: Number(editingTour.price),
        highlights: editingTour.highlights.split('\n').filter(Boolean),
        itinerary: editingTour.itinerary.split('\n').filter(Boolean),
        included: editingTour.included.split('\n').filter(Boolean),
      };

      const response = await fetch(`/api/tours/${editingTour.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tourData),
      });

      if (response.ok) {
        alert('Tour updated successfully!');
        setEditingTour(null);
        fetchTours();
      } else {
        alert('Failed to update tour');
      }
    } catch (error) {
      console.error('Error updating tour:', error);
      alert('Error updating tour');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 페이지 (이전 경로)</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            새 대시보드로 이동
          </button>
        </div>

        {/* 탭 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("carousel")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "carousel"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              캐러셀 이미지
            </button>
            <button
              onClick={() => setActiveTab("tours")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tours"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              투어 목록
            </button>
            <button
              onClick={() => setActiveTab("add-tour")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "add-tour"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              투어 추가
            </button>
          </nav>
        </div>

        {/* 이미지 업로드 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">이미지 업로드</h2>
          <div className="flex items-center gap-4">
            <label className="flex flex-col items-center justify-center w-64 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-2 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">클릭하여 업로드</span> 또는 드래그
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            {uploadedImage && (
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={uploadedImage}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(uploadedImage)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    복사
                  </button>
                </div>
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-w-xs max-h-32 object-cover rounded-md border border-gray-300"
                />
              </div>
            )}
            {uploading && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* 캐러셀 이미지 관리 */}
        {activeTab === "carousel" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">캐러셀 이미지 관리</h2>
            <div className="space-y-6">
              {carouselImages.map((image, index) => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        투어에서 불러오기
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        onChange={(e) => handleCarouselTourSelect(index, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>투어를 선택하세요</option>
                        {tours.map(tour => (
                          <option key={tour.id} value={tour.id}>{tour.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이미지 URL
                      </label>
                      <input
                        type="text"
                        value={image.url}
                        onChange={(e) => handleCarouselImageUpdate(index, "url", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="이미지 URL 입력"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        제목
                      </label>
                      <input
                        type="text"
                        value={image.title}
                        onChange={(e) => handleCarouselImageUpdate(index, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        설명
                      </label>
                      <input
                        type="text"
                        value={image.description}
                        onChange={(e) => handleCarouselImageUpdate(index, "description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-48 object-cover rounded-md border border-gray-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=이미지+없음";
                      }}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => copyToClipboard(image.url)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                      URL 복사
                    </button>
                    <button
                      onClick={handleSaveCarousel}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                저장 시 메인 페이지 캐러셀에 바로 반영됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 투어 목록/이미지 관리 */}
        {activeTab === "tours" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">투어 목록</h2>
            <div className="space-y-6">
              {tours.map((tour) => {
                const imageUrl = tourImages[tour.id] || tour.image;
                return (
                  <div key={tour.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">{tour.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          이미지 URL
                        </label>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => handleTourImageUpdate(tour.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="이미지 URL 입력"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => handleEditClick(tour)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm mr-2"
                        >
                          수정하기
                        </button>
                        <button
                          onClick={() => copyToClipboard(imageUrl)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                          URL 복사
                        </button>
                        <button
                          onClick={() => handleSaveTourImage(tour.id)}
                          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => handleDeleteTour(tour.id)}
                          className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <img
                        src={imageUrl}
                        alt={tour.title}
                        className="w-full h-48 object-cover rounded-md border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=이미지+없음";
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 투어 수정 모달 */}
        {editingTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">투어 수정</h2>
                <button
                  onClick={() => setEditingTour(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateTour} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">투어 제목</label>
                    <input
                      type="text"
                      required
                      value={editingTour.title}
                      onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">가격 (USD)</label>
                    <input
                      type="number"
                      required
                      value={editingTour.price}
                      onChange={(e) => setEditingTour({ ...editingTour, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">소요 시간</label>
                    <input
                      type="text"
                      required
                      value={editingTour.duration}
                      onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                    <input
                      type="text"
                      required
                      value={editingTour.image}
                      onChange={(e) => setEditingTour({ ...editingTour, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea
                    required
                    value={editingTour.description}
                    onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">하이라이트 (줄바꿈으로 구분)</label>
                  <textarea
                    value={editingTour.highlights}
                    onChange={(e) => setEditingTour({ ...editingTour, highlights: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                    placeholder="하이라이트 1&#13;&#10;하이라이트 2&#13;&#10;하이라이트 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">일정 (줄바꿈으로 구분)</label>
                  <textarea
                    value={editingTour.itinerary}
                    onChange={(e) => setEditingTour({ ...editingTour, itinerary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                    placeholder="Day 1: ...&#13;&#10;Day 2: ..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">포함 사항 (줄바꿈으로 구분)</label>
                  <textarea
                    value={editingTour.included}
                    onChange={(e) => setEditingTour({ ...editingTour, included: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                    placeholder="항목 1&#13;&#10;항목 2"
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingTour(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 투어 추가 */}
        {activeTab === "add-tour" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">새 투어 추가</h2>
            <form onSubmit={handleAddTour} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">투어 제목</label>
                  <input
                    type="text"
                    required
                    value={newTour.title}
                    onChange={(e) => setNewTour({ ...newTour, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가격 (USD)</label>
                  <input
                    type="number"
                    required
                    value={newTour.price}
                    onChange={(e) => setNewTour({ ...newTour, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">소요 시간 (예: 1 Day)</label>
                  <input
                    type="text"
                    required
                    value={newTour.duration}
                    onChange={(e) => setNewTour({ ...newTour, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                  <input
                    type="text"
                    required
                    value={newTour.image}
                    onChange={(e) => setNewTour({ ...newTour, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  required
                  value={newTour.description}
                  onChange={(e) => setNewTour({ ...newTour, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highlights (줄바꿈으로 구분)
                </label>
                <textarea
                  value={newTour.highlights}
                  onChange={(e) => setNewTour({ ...newTour, highlights: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  placeholder="Visit Gyeongbokgung Palace&#13;&#10;Explore Bukchon Hanok Village"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Itinerary (줄바꿈으로 구분)
                </label>
                <textarea
                  value={newTour.itinerary}
                  onChange={(e) => setNewTour({ ...newTour, itinerary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  placeholder="09:00 - Pickup&#13;&#10;10:00 - Tour Start"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Included (줄바꿈으로 구분)
                </label>
                <textarea
                  value={newTour.included}
                  onChange={(e) => setNewTour({ ...newTour, included: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  placeholder="Guide&#13;&#10;Entrance Fees"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  투어 추가하기
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
