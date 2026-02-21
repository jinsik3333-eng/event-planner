-- Moim 데이터베이스 스키마 (Supabase PostgreSQL)
-- 생성 일자: 2026-02-21
-- 실행 순서: Supabase SQL 에디터에서 순차적으로 실행

-- 1. Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kakao_id TEXT UNIQUE,
  name TEXT NOT NULL,
  profile_image TEXT,
  email TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Events 테이블
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  max_attendees INT,
  fee INT DEFAULT 0,
  status TEXT DEFAULT 'RECRUITING' CHECK (status IN ('RECRUITING', 'CONFIRMED', 'COMPLETED')),
  invite_code TEXT UNIQUE NOT NULL,
  kakao_pay_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EventMembers 테이블
CREATE TABLE IF NOT EXISTS event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_name TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('ATTENDING', 'NOT_ATTENDING', 'PENDING')),
  has_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Notices 테이블
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Carpools 테이블
CREATE TABLE IF NOT EXISTS carpools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats INT NOT NULL CHECK (seats > 0),
  departure TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CarpoolRequests 테이블
CREATE TABLE IF NOT EXISTS carpool_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carpool_id UUID NOT NULL REFERENCES carpools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_events_host_id ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_invite_code ON events(invite_code);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_user_id ON event_members(user_id);
CREATE INDEX IF NOT EXISTS idx_event_members_status ON event_members(status);

CREATE INDEX IF NOT EXISTS idx_notices_event_id ON notices(event_id);
CREATE INDEX IF NOT EXISTS idx_notices_author_id ON notices(author_id);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_carpools_event_id ON carpools(event_id);
CREATE INDEX IF NOT EXISTS idx_carpools_driver_id ON carpools(driver_id);

CREATE INDEX IF NOT EXISTS idx_carpool_requests_carpool_id ON carpool_requests(carpool_id);
CREATE INDEX IF NOT EXISTS idx_carpool_requests_user_id ON carpool_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_carpool_requests_status ON carpool_requests(status);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpools ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpool_requests ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정

-- 1. Users 정책
-- 모든 사용자는 모든 사용자 정보 조회 가능 (프로필 페이지 등)
CREATE POLICY "Users can view all profiles"
ON users FOR SELECT
USING (true);

-- 자신의 정보만 수정 가능
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- 2. Events 정책
-- 모든 인증된 사용자가 이벤트 조회 가능
CREATE POLICY "Events are viewable by everyone"
ON events FOR SELECT
USING (true);

-- 주최자만 생성 가능
CREATE POLICY "Users can create events"
ON events FOR INSERT
WITH CHECK (auth.uid() = host_id);

-- 주최자만 수정 가능
CREATE POLICY "Event host can update"
ON events FOR UPDATE
USING (auth.uid() = host_id);

-- 주최자만 삭제 가능
CREATE POLICY "Event host can delete"
ON events FOR DELETE
USING (auth.uid() = host_id);

-- 3. EventMembers 정책
-- 모든 인증된 사용자가 참여자 목록 조회 가능
CREATE POLICY "Event members are viewable"
ON event_members FOR SELECT
USING (true);

-- 누구나 참여자 추가 가능 (게스트 포함)
CREATE POLICY "Anyone can add participant"
ON event_members FOR INSERT
WITH CHECK (true);

-- 자신의 정보만 수정 가능
CREATE POLICY "Users can update their own status"
ON event_members FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4. Notices 정책
-- 모든 인증된 사용자가 공지 조회 가능
CREATE POLICY "Notices are viewable"
ON notices FOR SELECT
USING (true);

-- 주최자만 공지 작성 가능
CREATE POLICY "Event host can create notice"
ON notices FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_id
    AND events.host_id = auth.uid()
  )
);

-- 작성자만 수정 가능
CREATE POLICY "Notice author can update"
ON notices FOR UPDATE
USING (auth.uid() = author_id);

-- 작성자만 삭제 가능
CREATE POLICY "Notice author can delete"
ON notices FOR DELETE
USING (auth.uid() = author_id);

-- 5. Carpools 정책
-- 모든 인증된 사용자가 카풀 정보 조회 가능
CREATE POLICY "Carpools are viewable"
ON carpools FOR SELECT
USING (true);

-- 운전자 등록 (이벤트 참여자만)
CREATE POLICY "Event participants can register carpool"
ON carpools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM event_members
    WHERE event_members.event_id = event_id
    AND event_members.user_id = auth.uid()
  )
);

-- 운전자만 수정 가능
CREATE POLICY "Driver can update carpool"
ON carpools FOR UPDATE
USING (auth.uid() = driver_id);

-- 운전자만 삭제 가능
CREATE POLICY "Driver can delete carpool"
ON carpools FOR DELETE
USING (auth.uid() = driver_id);

-- 6. CarpoolRequests 정책
-- 모든 인증된 사용자가 신청 조회 가능
CREATE POLICY "Carpool requests are viewable"
ON carpool_requests FOR SELECT
USING (true);

-- 이벤트 참여자만 신청 가능
CREATE POLICY "Event participants can request ride"
ON carpool_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM carpool_requests cr
    JOIN carpools c ON cr.carpool_id = c.id
    JOIN event_members em ON c.event_id = em.event_id
    WHERE em.user_id = auth.uid()
  )
);

-- 신청자 또는 운전자가 수정 가능
CREATE POLICY "Request can be updated"
ON carpool_requests FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM carpools
    WHERE carpools.id = carpool_id
    AND carpools.driver_id = auth.uid()
  )
);

-- 신청자 또는 운전자가 삭제 가능
CREATE POLICY "Request can be deleted"
ON carpool_requests FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM carpools
    WHERE carpools.id = carpool_id
    AND carpools.driver_id = auth.uid()
  )
);

-- 함수: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: updated_at 자동 갱신
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_members_updated_at BEFORE UPDATE ON event_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carpools_updated_at BEFORE UPDATE ON carpools
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carpool_requests_updated_at BEFORE UPDATE ON carpool_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
