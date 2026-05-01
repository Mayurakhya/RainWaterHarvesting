import React from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaExternalLinkAlt } from "react-icons/fa";
import { BlogNav, blogPosts } from "./Blog";

function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return (
      <div className="app-shell">
        <BlogNav />
        <main className="page-pad">
          <div className="glass-panel max-w-3xl mx-auto p-8 rounded-[28px] text-center">
            <h1 className="section-title">Post not found</h1>
            <Link to="/blogs" className="btn-primary px-6 py-3 mt-6">
              Back to Blogs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <BlogNav />
      <main className="blog-post">
        <article className="max-w-5xl mx-auto">
          <Link to="/blogs" className="btn-ghost px-5 py-2 mb-8">
            <FaArrowLeft /> All Blogs
          </Link>

          <header className="blog-hero">
            <img src={post.image} alt={post.title} />
            <div className="blog-hero-copy">
              <span className="eyebrow">{post.eyebrow}</span>
              <h1>{post.title}</h1>
              <p>{post.summary}</p>
              <span className="blog-meta">{post.readTime}</span>
            </div>
          </header>

          <div className="blog-article-grid">
            <aside className="blog-aside">
              <p className="field-label">Image Credit</p>
              <a href={post.imageSource} target="_blank" rel="noreferrer">
                {post.imageCredit} <FaExternalLinkAlt />
              </a>
              {post.sourceNote && (
                <>
                  <p className="field-label mt-8">Context Source</p>
                  <a href={post.sourceLink} target="_blank" rel="noreferrer">
                    Guardian water report <FaExternalLinkAlt />
                  </a>
                </>
              )}
            </aside>

            <div className="blog-copy">
              {post.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </section>
              ))}

              {post.sourceNote && (
                <section className="source-note">
                  <h2>Why it matters now</h2>
                  <p>{post.sourceNote}</p>
                </section>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export default BlogPost;
