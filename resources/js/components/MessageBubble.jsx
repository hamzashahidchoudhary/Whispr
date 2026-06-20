import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

export default function MessageBubble({ message }) {
    const { user } = useAuth();
    const isOwn = message.sender_id === user?.id;

    if (message.is_deleted) {
        return (
            <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
                <span className="text-xs text-gray-500 italic px-3 py-1">
                    This message was deleted
                </span>
            </div>
        );
    }

    return (
        <div
            className={`flex ${
                isOwn ? "flex-row-reverse" : "flex-row"
            } items-end gap-2 mb-2`}
        >
            {!isOwn && (
                <img
                    src={message.sender?.avatar_url || "/default-avatar.png"}
                    alt={message.sender?.name || "User"}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
            )}

            <div
                className={`max-w-xs lg:max-w-md flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                }`}
            >
                {!isOwn && (
                    <span className="text-xs text-gray-400 mb-1 px-1">
                        {message.sender?.name}
                    </span>
                )}

                {message.reply_to && (
                    <div className="bg-gray-700 border-l-2 border-indigo-400 px-3 py-1 rounded text-xs text-gray-400 mb-1 max-w-full">
                        <span className="font-medium text-indigo-400">
                            {message.reply_to.sender?.name}
                        </span>
                        <p className="truncate">
                            {message.reply_to.body}
                        </p>
                    </div>
                )}

                <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                        isOwn
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-gray-700 text-gray-100 rounded-bl-sm"
                    }`}
                >
                    {message.body}

                    {message.attachments?.map((att) => (
                        <div key={att.id} className="mt-2">
                            {att.mime_type?.startsWith("image/") ? (
                                <img
                                    src={`/storage/${att.path}`}
                                    alt={att.name}
                                    className="rounded-lg max-w-xs max-h-48 object-cover"
                                />
                            ) : (
                                <a
                                    href={`/storage/${att.path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2 text-xs hover:bg-black/30"
                                >
                                    📎 {att.name}
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-1 mt-0.5 px-1">
                    <span className="text-[10px] text-gray-500">
                        {message.created_at
                            ? format(new Date(message.created_at), "h:mm a")
                            : ""}
                    </span>

                    {message.is_edited && (
                        <span className="text-[10px] text-gray-500">
                            edited
                        </span>
                    )}

                    {isOwn && (
                        <span className="text-[10px] text-gray-500">
                            {message.read_at
                                ? "✓✓"
                                : message.delivered_at
                                ? "✓✓"
                                : "✓"}
                        </span>
                    )}
                </div>

                {message.reactions?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                        {Object.entries(
                            message.reactions.reduce((acc, reaction) => {
                                acc[reaction.emoji] =
                                    (acc[reaction.emoji] || 0) + 1;
                                return acc;
                            }, {})
                        ).map(([emoji, count]) => (
                            <span
                                key={emoji}
                                className="bg-gray-700 rounded-full px-2 py-0.5 text-xs"
                            >
                                {emoji} {count}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}