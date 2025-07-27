import React, { useState, useEffect } from 'react'
import { Star, User, Calendar, ThumbsUp, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string
  comment: string
  helpful_count: number
  created_at: string
  updated_at: string
  profiles?: {
    full_name?: string
  }
  products?: {
    name: string
  }
}

interface ReviewFormData {
  rating: number
  title: string
  comment: string
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md' 
}: {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${sizeClasses[size]} ${readonly ? '' : 'cursor-pointer hover:scale-110 transition-transform'}`}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
        >
          <Star
            className={`w-full h-full ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

const ReviewCard = ({ 
  review, 
  onHelpfulClick 
}: { 
  review: Review
  onHelpfulClick: (reviewId: string) => void 
}) => {
  const [isHelpful, setIsHelpful] = useState(false)

  const handleHelpfulClick = () => {
    setIsHelpful(!isHelpful)
    onHelpfulClick(review.id)
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-medium">{review.profiles?.full_name || 'Anonymous'}</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                {format(new Date(review.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
          <StarRating rating={review.rating} readonly size="sm" />
        </div>

        <div className="mb-3">
          <h4 className="font-medium mb-2">{review.title}</h4>
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm text-gray-500">
            Review for: <span className="font-medium">{review.products?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpfulClick}
              className={`${isHelpful ? 'text-green-600' : 'text-gray-500'}`}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Helpful ({review.helpful_count})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ReviewForm = ({ 
  productId, 
  onReviewSubmit 
}: { 
  productId: string
  onReviewSubmit: (review: Review) => void 
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please log in to submit a review')
      return
    }

    if (formData.rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (!formData.title.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: productId,
          user_id: user.id,
          rating: formData.rating,
          title: formData.title.trim(),
          comment: formData.comment.trim(),
          helpful_count: 0
        }])
        .select(`
          *,
          profiles (full_name),
          products (name)
        `)
        .single()

      if (error) throw error

      toast.success('Review submitted successfully!')
      onReviewSubmit(data)
      setFormData({ rating: 0, title: '', comment: '' })
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login to Review</h3>
          <p className="text-gray-600 mb-4">Please log in to share your experience with this product</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>Share your experience with this product</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData({ ...formData, rating })}
                size="lg"
              />
              <span className="text-sm text-gray-500 ml-2">
                {formData.rating > 0 && `${formData.rating} out of 5 stars`}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your experience"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <textarea
              id="comment"
              className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm resize-vertical"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Tell others about your experience with this product..."
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.comment.length}/500 characters
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

const ReviewSummary = ({ reviews }: { reviews: Review[] }) => {
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(review => review.rating === rating).length
  )

  if (totalReviews === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">Be the first to review this product!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
        <CardDescription>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} readonly />
            <div className="text-sm text-gray-500 mt-1">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating, index) => (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-3">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: totalReviews > 0 ? `${(ratingCounts[index] / totalReviews) * 100}%` : '0%'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">
                  {ratingCounts[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const ReviewSystem = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name),
          products (name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = (newReview: Review) => {
    setReviews([newReview, ...reviews])
    setShowReviewForm(false)
  }

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      const currentReview = reviews.find(r => r.id === reviewId)
      if (!currentReview) return

      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: currentReview.helpful_count + 1 })
        .eq('id', reviewId)

      if (error) throw error

      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpful_count: review.helpful_count + 1 }
          : review
      ))

      toast.success('Thank you for your feedback!')
    } catch (error) {
      console.error('Error updating helpful count:', error)
      toast.error('Failed to update helpful count')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ReviewSummary reviews={reviews} />

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Reviews</h3>
        <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
          <DialogTrigger asChild>
            <Button>Write a Review</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience with this product
              </DialogDescription>
            </DialogHeader>
            <ReviewForm
              productId={productId}
              onReviewSubmit={handleReviewSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpfulClick={handleHelpfulClick}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share your experience!</p>
              <Button onClick={() => setShowReviewForm(true)}>
                Write First Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}