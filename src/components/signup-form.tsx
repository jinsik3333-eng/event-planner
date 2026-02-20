'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signupSchema, type SignupFormData } from '@/types'
import { FormError } from './forms/form-error'

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: SignupFormData) => {
    console.log('회원가입 데이터:', data)
    // TODO: 실제 회원가입 로직 구현 (Server Action 호출)
  }
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">회원가입</CardTitle>
        <CardDescription>새 계정을 만들어 서비스를 시작하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register('email')}
            />
            {errors.email && <FormError error={errors.email} />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="최소 8자 이상"
              {...register('password')}
            />
            {errors.password && <FormError error={errors.password} />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <FormError error={errors.confirmPassword} />
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '회원가입 중...' : '회원가입'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="w-full text-center text-sm">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
