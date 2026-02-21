/**
 * 모임 제목에 따라 적절한 이미지 URL을 선택합니다
 */
export function selectImageByTitle(title: string): string {
  const titleLower = title.toLowerCase()

  // 카테고리별 이미지 매핑
  if (
    titleLower.includes('맛집') ||
    titleLower.includes('식사') ||
    titleLower.includes('밥') ||
    titleLower.includes('음식')
  ) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('등산') ||
    titleLower.includes('하이킹') ||
    titleLower.includes('트레킹')
  ) {
    return 'https://images.unsplash.com/photo-1551632440-9f60a5d1e71b?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('영화') ||
    titleLower.includes('영상') ||
    titleLower.includes('시네마')
  ) {
    return 'https://images.unsplash.com/photo-1533109752211-118fcf4312b5?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('카페') ||
    titleLower.includes('커피') ||
    titleLower.includes('차')
  ) {
    return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('스포츠') ||
    titleLower.includes('축구') ||
    titleLower.includes('농구') ||
    titleLower.includes('배구') ||
    titleLower.includes('운동')
  ) {
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('여행') ||
    titleLower.includes('투어') ||
    titleLower.includes('트립')
  ) {
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('공부') ||
    titleLower.includes('스터디') ||
    titleLower.includes('강좌')
  ) {
    return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('파티') ||
    titleLower.includes('축제') ||
    titleLower.includes('행사')
  ) {
    return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('게임') ||
    titleLower.includes('보드게임') ||
    titleLower.includes('게이밍')
  ) {
    return 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('음악') ||
    titleLower.includes('공연') ||
    titleLower.includes('콘서트')
  ) {
    return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop'
  }

  if (
    titleLower.includes('미술') ||
    titleLower.includes('전시') ||
    titleLower.includes('갤러리')
  ) {
    return 'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=500&h=300&fit=crop'
  }

  // 기본 이미지
  return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'
}
