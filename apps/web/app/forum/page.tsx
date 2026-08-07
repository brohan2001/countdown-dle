"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Thread {
  id: string;
  puzzle_id: string;
  created_at: string;
  puzzle?: {
    play_date: string;
  };
  post_count?: number;
}

interface Post {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  user_name?: string;
}

export default function ForumPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostBody, setNewPostBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        const { data, error: threadsError } = await supabase
          .from("forum_threads")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (threadsError) throw threadsError;
        setThreads(data || []);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id || null);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load threads");
        setLoading(false);
      }
    };

    loadThreads();
  }, []);

  const loadPosts = async (threadId: string) => {
    try {
      if (!userId) {
        setError("Must be logged in to view forum posts");
        return;
      }

      const thread = threads.find((t) => t.id === threadId);
      if (!thread) return;

      // Check if user has completed this puzzle
      const { data: result, error: resultError } = await supabase
        .from("game_results")
        .select("id")
        .eq("puzzle_id", thread.puzzle_id)
        .eq("user_id", userId)
        .single();

      if (resultError && resultError.code !== "PGRST116") throw resultError;

      if (!result) {
        setError("You must complete this puzzle to view the forum");
        setHasCompleted(false);
        return;
      }

      setHasCompleted(true);

      // Load posts
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select(`
          id,
          body,
          created_at,
          user_id,
          profiles(display_name)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (postsError) throw postsError;

      const formattedPosts = (postsData || []).map((p: any) => ({
        id: p.id,
        body: p.body,
        created_at: p.created_at,
        user_id: p.user_id,
        user_name: p.profiles?.display_name || "Anonymous",
      }));

      setPosts(formattedPosts);
      setNewPostBody("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    }
  };

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !userId || !newPostBody.trim()) return;

    setPosting(true);
    setError(null);

    try {
      const { error: postError } = await supabase
        .from("forum_posts")
        .insert({
          thread_id: selectedThread.id,
          user_id: userId,
          body: newPostBody,
        });

      if (postError) throw postError;

      setNewPostBody("");
      await loadPosts(selectedThread.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post message");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Daily Puzzle Forum</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Threads List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 bg-slate-800 rounded-lg p-6 shadow-lg max-h-96 overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Discussions</h2>
            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => {
                    setSelectedThread(thread);
                    loadPosts(thread.id);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedThread?.id === thread.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {thread.puzzle ? new Date(thread.puzzle.play_date).toLocaleDateString() : "Unknown"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {thread.post_count || 0} posts
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Posts Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-2 bg-slate-800 rounded-lg p-6 shadow-lg"
          >
            {selectedThread ? (
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {selectedThread.puzzle
                    ? `Discussion for ${new Date(selectedThread.puzzle.play_date).toLocaleDateString()}`
                    : "Discussion"}
                </h2>

                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm mb-4">
                    {error}
                  </div>
                )}

                {!hasCompleted && userId && (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg text-yellow-300 text-sm mb-4">
                    Complete this puzzle to view the forum and post messages.
                  </div>
                )}

                {/* Posts */}
                <div className="flex-1 mb-4 max-h-64 overflow-y-auto space-y-3">
                  {posts.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No posts yet. Be the first!</p>
                  ) : (
                    posts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-700 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-semibold text-slate-300">
                            {post.user_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(post.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-slate-200">{post.body}</p>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Post Form */}
                {hasCompleted && userId && (
                  <form onSubmit={handlePostMessage} className="space-y-3">
                    <textarea
                      value={newPostBody}
                      onChange={(e) => setNewPostBody(e.target.value)}
                      placeholder="Share your thoughts about this puzzle..."
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                      rows={3}
                    />
                    <button
                      type="submit"
                      disabled={posting || !newPostBody.trim()}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                      {posting ? "Posting..." : "Post Message"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">Select a puzzle thread to view discussion</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
