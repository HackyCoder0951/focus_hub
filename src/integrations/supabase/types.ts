export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_members: {
        Row: {
          chat_id: string | null
          id: string
          is_admin: boolean | null
          joined_at: string
          user_id: string | null
          typing?: boolean
        }
        Insert: {
          chat_id?: string | null
          id?: string
          is_admin?: boolean | null
          joined_at?: string
          user_id?: string | null
          typing?: boolean
        }
        Update: {
          chat_id?: string | null
          id?: string
          is_admin?: boolean | null
          joined_at?: string
          user_id?: string | null
          typing?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          chat_id: string | null
          content: string | null
          created_at: string
          id: string
          media_url: string | null
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_group: boolean
          name: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          name?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          name?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      filemodels: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filemodels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          media_url: string | null
          updated_at: string
          user_id: string | null
          flag_status: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          updated_at?: string
          user_id?: string | null
          flag_status?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          updated_at?: string
          user_id?: string | null
          flag_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          location: string | null
          member_type: string | null
          settings: Json | null
          updated_at: string
          website: string | null
          status: string | null
          last_seen: string | null
          graduation_year: number | null
          company: string | null
          designation: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          member_type?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
          status?: string | null
          last_seen?: string | null
          graduation_year?: number | null
          company?: string | null
          designation?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          member_type?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
          status?: string | null
          last_seen?: string | null
          graduation_year?: number | null
          company?: string | null
          designation?: string | null
        }
        Relationships: []
      }
      alumni_verification_requests: {
        Row: {
          id: string
          user_id: string
          graduation_year: number | null
          company: string | null
          designation: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          graduation_year?: number | null
          company?: string | null
          designation?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          graduation_year?: number | null
          company?: string | null
          designation?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumni_verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_connections: {
        Row: {
          id: string
          student_id: string
          alumni_id: string
          message: string | null
          status: string
          chat_id: string | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          alumni_id: string
          message?: string | null
          status?: string
          chat_id?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          alumni_id?: string
          message?: string | null
          status?: string
          chat_id?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_connections_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_connections_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      qanotifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          question_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          question_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          question_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qanotifications_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questionanswers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qanotifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questionanswers: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          is_answered: boolean
          question: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean
          question: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean
          question?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionanswers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      content_flags: {
        Row: {
          id: string;
          flagged_by_user_id: string;
          post_id: string | null;
          comment_id: string | null;
          reason: string | null;
          created_at: string;
          status: string | null;
        };
        Insert: {
          id?: string;
          flagged_by_user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          reason?: string | null;
          created_at?: string;
          status?: string | null;
        };
        Update: {
          id?: string;
          flagged_by_user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          reason?: string | null;
          created_at?: string;
          status?: string | null;
        };
        Relationships: [];
      }
      questions: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          body: string;
          category: string | null;
          status: string;
          best_answer_id: number | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          title: string;
          body: string;
          category?: string | null;
          status?: string;
          best_answer_id?: number | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string;
          body?: string;
          category?: string | null;
          status?: string;
          best_answer_id?: number | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_best_answer_id_fkey"
            columns: ["best_answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          }
        ];
      };
      question_tags: {
        Row: {
          id: number;
          question_id: number;
          tag_name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          question_id: number;
          tag_name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          question_id?: number;
          tag_name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ];
      };
      question_votes: {
        Row: {
          id: number;
          question_id: number;
          user_id: string;
          vote_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          question_id: number;
          user_id: string;
          vote_value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          question_id?: number;
          user_id?: string;
          vote_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_votes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ];
      };
      question_notifications: {
        Row: {
          id: number;
          question_id: number;
          user_id: string;
          notification_type: string;
          message: string;
          is_read: boolean;
          related_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          question_id: number;
          user_id: string;
          notification_type: string;
          message: string;
          is_read?: boolean;
          related_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          question_id?: number;
          user_id?: string;
          notification_type?: string;
          message?: string;
          is_read?: boolean;
          related_id?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_notifications_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ];
      };
      answers: {
        Row: {
          id: number;
          question_id: number;
          user_id: string;
          body: string;
          is_accepted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          question_id: number;
          user_id: string;
          body: string;
          is_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          question_id?: number;
          user_id?: string;
          body?: string;
          is_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ];
      };
      ai_answers: {
        Row: {
          id: number;
          question_id: number;
          answer_text: string;
          confidence_score: number | null;
          model_used: string | null;
          tokens_used: number | null;
          processing_time_ms: number | null;
          relevance_score: number | null;
          completeness_score: number | null;
          user_feedback_rating: number | null;
          generation_attempts: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          question_id: number;
          answer_text: string;
          confidence_score?: number | null;
          model_used?: string | null;
          tokens_used?: number | null;
          processing_time_ms?: number | null;
          relevance_score?: number | null;
          completeness_score?: number | null;
          user_feedback_rating?: number | null;
          generation_attempts?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          question_id?: number;
          answer_text?: string;
          confidence_score?: number | null;
          model_used?: string | null;
          tokens_used?: number | null;
          processing_time_ms?: number | null;
          relevance_score?: number | null;
          completeness_score?: number | null;
          user_feedback_rating?: number | null;
          generation_attempts?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ];
      };
      answer_comments: {
        Row: {
          id: number;
          answer_id: number;
          user_id: string;
          parent_comment_id: number | null;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          answer_id: number;
          user_id: string;
          parent_comment_id?: number | null;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          answer_id?: number;
          user_id?: string;
          parent_comment_id?: number | null;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answer_comments_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "answer_comments"
            referencedColumns: ["id"]
          }
        ];
      };
      answer_votes: {
        Row: {
          id: number;
          answer_id: number;
          user_id: string;
          vote_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          answer_id: number;
          user_id: string;
          vote_value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          answer_id?: number;
          user_id?: string;
          vote_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answer_votes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ];
      };
      answer_notifications: {
        Row: {
          id: number;
          answer_id: number;
          user_id: string;
          notification_type: string;
          message: string;
          is_read: boolean;
          related_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          answer_id: number;
          user_id: string;
          notification_type: string;
          message: string;
          is_read?: boolean;
          related_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          answer_id?: number;
          user_id?: string;
          notification_type?: string;
          message?: string;
          is_read?: boolean;
          related_id?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answer_notifications_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ];
      };
      answer_tags: {
        Row: {
          id: number;
          answer_id: number;
          tag_name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          answer_id: number;
          tag_name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          answer_id?: number;
          tag_name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answer_tags_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          }
        ];
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      leave_group: {
        Args: { p_chat_id: string; p_user_id: string }
        Returns: undefined
      }
      get_vote_counts: {
        Args: {
          target_type: string;
          target_id: number;
        };
        Returns: {
          vote_count: number;
          vote_score: number;
        }[];
      };
      get_unread_notification_count: {
        Args: {
          user_uuid: string;
        };
        Returns: number;
      };
      mark_notifications_as_read: {
        Args: {
          user_uuid: string;
          notification_ids: number[];
        };
        Returns: number;
      };
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
