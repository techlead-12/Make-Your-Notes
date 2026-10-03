import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { removeFromPaste, togglePinPaste } from "../redux/pasteSlice";

const Paste = () => {
    const pastes = useSelector((state)=>state.paste.pastes);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showPinnedOnly, setShowPinnedOnly] = useState(false);
    const filteredPastes = pastes
        .filter((paste) =>
            paste.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            paste.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((paste) => !showPinnedOnly || paste.pinned)
        .sort((firstPaste, secondPaste) =>
            Number(secondPaste.pinned) - Number(firstPaste.pinned)
        );

    async function copyPaste(content) {
        await navigator.clipboard.writeText(content);
        toast.success("Paste copied.");
    }

    async function sharePaste(paste) {
        const url = `${window.location.origin}/pastes/${paste._id}`;

        if (navigator.share) {
            await navigator.share({
                title: paste.title,
                text: paste.content,
                url,
            });
            return;
        }

        await navigator.clipboard.writeText(url);
        toast.success("Paste link copied.");
    }

  return (
    <div className="mx-auto mt-8 w-full max-w-3xl px-4">
      <input
        className="w-full rounded-2xl border border-gray-300 p-3"
        type="search"
        placeholder="Search pastes"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <button
        className="mt-4 rounded-xl border border-yellow-500 px-3 py-2 text-yellow-700"
        type="button"
        onClick={() => setShowPinnedOnly((current) => !current)}
      >
        {showPinnedOnly ? "Show all pastes" : "Show pinned only"}
      </button>
      <div className="mt-6 space-y-4">
        {filteredPastes.map((paste) => (
          <div
            className="rounded-2xl border border-gray-300 p-4"
            key={paste._id}
          >
            <div className="flex items-center justify-between gap-4">
              <Link
                className="font-medium text-blue-600 hover:underline"
                to={`/pastes/${paste._id}`}
              >
                {paste.pinned ? "[Pinned] " : ""}{paste.title}
              </Link>
              <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs uppercase text-gray-600">
                {paste.type ?? "text"}
              </span>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  className="rounded-xl bg-yellow-500 px-3 py-2 text-white"
                  type="button"
                  onClick={() => dispatch(togglePinPaste(paste._id))}
                >
                  {paste.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  className="rounded-xl bg-green-600 px-3 py-2 text-white"
                  type="button"
                  onClick={() => copyPaste(paste.content)}
                >
                  Copy
                </button>
                <button
                  className="rounded-xl bg-purple-600 px-3 py-2 text-white"
                  type="button"
                  onClick={() => sharePaste(paste)}
                >
                  Share
                </button>
                <button
                  className="rounded-xl bg-blue-600 px-3 py-2 text-white"
                  type="button"
                  onClick={() => navigate(`/?pasteId=${paste._id}`)}
                >
                  Edit
                </button>
                <button
                  className="rounded-xl bg-red-600 px-3 py-2 text-white"
                  type="button"
                  onClick={() => dispatch(removeFromPaste(paste._id))}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredPastes.length === 0 && (
          <p className="text-gray-500">No pastes found.</p>
        )}
      </div>
    </div>
  )
}

export default Paste
