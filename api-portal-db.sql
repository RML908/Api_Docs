--
-- PostgreSQL database dump
--

\restrict ilot5aWkcMgFOFM87tHlO5KXmnIet1mUVBWkDdSVbbJRzXhGhEGvQbtVPR1Rgg2

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id integer NOT NULL,
    name text NOT NULL,
    key_hash text NOT NULL,
    key_prefix text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: endpoints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.endpoints (
    id integer NOT NULL,
    group_id integer NOT NULL,
    method text DEFAULT 'GET'::text NOT NULL,
    path text NOT NULL,
    summary text NOT NULL,
    description text,
    status text DEFAULT 'draft'::text NOT NULL,
    params text,
    response_example text,
    response_status integer DEFAULT 200,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version text DEFAULT 'v1'::text NOT NULL
);


--
-- Name: endpoints_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.endpoints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: endpoints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.endpoints_id_seq OWNED BY public.endpoints.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    icon text DEFAULT '📁'::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: endpoints id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.endpoints ALTER COLUMN id SET DEFAULT nextval('public.endpoints_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_keys (id, name, key_hash, key_prefix, is_active, last_used_at, created_at) FROM stdin;
\.


--
-- Data for Name: endpoints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.endpoints (id, group_id, method, path, summary, description, status, params, response_example, response_status, sort_order, created_at, updated_at, version) FROM stdin;
1	1	POST	/api/v1/auth/login	Log in with email and password	Exchange credentials for a short-lived access token and a refresh token stored in a cookie.	published	[{"name":"email","type":"string","in":"body","required":true,"description":"User email address"},{"name":"password","type":"string","in":"body","required":true,"description":"Plaintext password"}]	{"accessToken":"eyJhbGciOiJIUzI1NiJ9...","expiresIn":3600}	200	0	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
2	1	POST	/api/v1/auth/refresh	Refresh access token	Exchange a valid refresh token cookie for a new access token.	published	\N	{"accessToken":"eyJhbGciOiJIUzI1NiJ9...","expiresIn":3600}	200	1	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
3	1	POST	/api/v1/auth/logout	End the current session	Revoke the refresh token and clear the session cookie.	published	\N	{}	204	2	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
4	2	GET	/api/v1/users	List all users	Returns a paginated list of all user accounts. Requires admin role.	published	[{"name":"page","type":"integer","in":"query","required":false,"description":"Page number (default 1)"},{"name":"limit","type":"integer","in":"query","required":false,"description":"Items per page (default 20)"}]	{"users":[{"id":1,"email":"alice@example.com","role":"admin"}],"total":1,"page":1}	200	0	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
5	2	POST	/api/v1/users	Create a new user	Register a new user account. Sends a verification email on success.	published	[{"name":"email","type":"string","in":"body","required":true,"description":"User email"},{"name":"name","type":"string","in":"body","required":true,"description":"Full name"},{"name":"role","type":"string","in":"body","required":false,"description":"Role: user | admin (default: user)"}]	{"id":42,"email":"bob@example.com","name":"Bob","role":"user","createdAt":"2026-01-01T00:00:00Z"}	201	1	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
6	2	GET	/api/v1/users/:id	Get user by ID	\N	published	[{"name":"id","type":"integer","in":"path","required":true,"description":"User ID"}]	{"id":42,"email":"bob@example.com","name":"Bob","role":"user"}	200	2	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
7	2	PATCH	/api/v1/users/:id	Update user profile	\N	published	[{"name":"id","type":"integer","in":"path","required":true,"description":"User ID"},{"name":"name","type":"string","in":"body","required":false,"description":"New full name"}]	{"id":42,"name":"Bobby","updatedAt":"2026-06-20T12:00:00Z"}	200	3	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
8	2	DELETE	/api/v1/users/:id	Delete a user account	\N	draft	[{"name":"id","type":"integer","in":"path","required":true,"description":"User ID"}]	{}	204	4	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
9	3	GET	/api/v1/posts	List published posts	Returns a list of all published content items sorted by creation date descending.	published	[{"name":"q","type":"string","in":"query","required":false,"description":"Search query"}]	{"posts":[{"id":1,"title":"Hello World","slug":"hello-world","publishedAt":"2026-06-01"}]}	200	0	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
10	3	POST	/api/v1/posts	Create a new post	\N	published	[{"name":"title","type":"string","in":"body","required":true,"description":"Post title"},{"name":"body","type":"string","in":"body","required":true,"description":"Markdown content"}]	{"id":7,"title":"Hello World","slug":"hello-world","createdAt":"2026-06-20T00:00:00Z"}	201	1	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
11	3	DELETE	/api/v1/posts/:id	Delete a post	\N	deprecated	[{"name":"id","type":"integer","in":"path","required":true,"description":"Post ID"}]	{}	204	2	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
12	4	GET	/api/v1/webhooks	List webhook subscriptions	\N	published	\N	{"webhooks":[{"id":1,"url":"https://example.com/hook","events":["user.created","post.published"]}]}	200	0	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
13	4	POST	/api/v1/webhooks	Register a webhook	Subscribe a URL to receive HTTP POST callbacks when specified events occur.	published	[{"name":"url","type":"string","in":"body","required":true,"description":"HTTPS endpoint to deliver events to"},{"name":"events","type":"string[]","in":"body","required":true,"description":"Event types to subscribe to"}]	{"id":2,"url":"https://example.com/hook","secret":"whsec_abc123"}	201	1	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
14	4	DELETE	/api/v1/webhooks/:id	Remove a webhook subscription	\N	draft	[{"name":"id","type":"integer","in":"path","required":true,"description":"Webhook ID"}]	{}	204	2	2026-06-20 13:13:15.02407+00	2026-06-20 13:13:15.02407+00	v1
15	1	POST	/api/v2/auth/login	Log in (v2) — supports MFA	Enhanced login flow with optional multi-factor authentication support.	published	[{"name":"email","type":"string","in":"body","required":true,"description":"User email address"},{"name":"password","type":"string","in":"body","required":true,"description":"Plaintext password"},{"name":"mfaCode","type":"string","in":"body","required":false,"description":"6-digit MFA code if enabled"}]	{"accessToken":"eyJhbGciOiJIUzI1NiJ9...","mfaRequired":false,"expiresIn":3600}	200	10	2026-06-20 13:48:37.246205+00	2026-06-20 13:48:37.246205+00	v2
16	2	GET	/api/v2/users	List users (v2) — with cursor pagination	Returns a cursor-paginated list of users. Replaces offset-based pagination from v1.	published	[{"name":"cursor","type":"string","in":"query","required":false,"description":"Pagination cursor from previous response"},{"name":"limit","type":"integer","in":"query","required":false,"description":"Items per page (default 20, max 100)"},{"name":"role","type":"string","in":"query","required":false,"description":"Filter by role: user | admin"}]	{"users":[{"id":1,"email":"alice@example.com","role":"admin"}],"nextCursor":"cur_abc123","hasMore":true}	200	10	2026-06-20 13:48:37.246205+00	2026-06-20 13:48:37.246205+00	v2
17	2	POST	/api/v2/users/bulk	Bulk create users (v2)	Create up to 100 users in a single request. Returns partial success results.	draft	[{"name":"users","type":"array","in":"body","required":true,"description":"Array of user objects (max 100)"}]	{"created":98,"failed":2,"errors":[{"index":5,"error":"Duplicate email"}]}	207	11	2026-06-20 13:48:37.246205+00	2026-06-20 13:48:37.246205+00	v2
18	3	GET	/api/v2/content	List content items (v2) — unified feed	Unified endpoint replacing separate /posts, /articles, /media endpoints in v1.	published	[{"name":"type","type":"string","in":"query","required":false,"description":"Filter by type: post | article | media"},{"name":"q","type":"string","in":"query","required":false,"description":"Full-text search"}]	{"items":[{"id":1,"type":"post","title":"Hello World","publishedAt":"2026-06-01"}],"total":42}	200	10	2026-06-20 13:48:37.246205+00	2026-06-20 13:48:37.246205+00	v2
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, name, description, icon, sort_order, created_at, updated_at) FROM stdin;
1	Authentication	Login, logout, token refresh and session management.	🔐	0	2026-06-20 13:13:14.975615+00	2026-06-20 13:13:14.975615+00
2	Users	Create, read, update and delete user accounts.	👤	1	2026-06-20 13:13:14.975615+00	2026-06-20 13:13:14.975615+00
3	Content	Manage posts, articles, and media assets.	📄	2	2026-06-20 13:13:14.975615+00	2026-06-20 13:13:14.975615+00
4	Webhooks	Subscribe to real-time event notifications.	🪝	3	2026-06-20 13:13:14.975615+00	2026-06-20 13:13:14.975615+00
\.


--
-- Name: api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_keys_id_seq', 1, false);


--
-- Name: endpoints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.endpoints_id_seq', 18, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.groups_id_seq', 4, true);


--
-- Name: api_keys api_keys_key_hash_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_unique UNIQUE (key_hash);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: endpoints endpoints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT endpoints_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: endpoints endpoints_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT endpoints_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ilot5aWkcMgFOFM87tHlO5KXmnIet1mUVBWkDdSVbbJRzXhGhEGvQbtVPR1Rgg2

