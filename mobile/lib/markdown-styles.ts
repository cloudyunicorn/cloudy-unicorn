// Shared Markdown Styles for React Native
// Matches the prose styling from the Next.js version
import { StyleSheet } from 'react-native';

// Markdown styles matching Next.js prose styling
export const markdownStyles = StyleSheet.create({
    // Base text - darker/muted for saved items
    body: {
        color: '#4b5563',  // Even darker gray (gray-600)
        fontSize: 15,
        lineHeight: 24,
    },

    // Headings - matching Next.js: text-xl font-bold mt-6 mb-3
    heading1: {
        color: '#f3f4f6',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
    },
    heading2: {
        color: '#f3f4f6',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    heading3: {
        color: '#f3f4f6',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
    },
    heading4: {
        color: '#f3f4f6',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    heading5: {
        color: '#f3f4f6',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 6,
    },

    // Text styles - matching Next.js: font-semibold, italic
    strong: {
        color: '#f3f4f6',
        fontWeight: '600',  // semibold
    },
    em: {
        color: '#d1d5db',
        fontStyle: 'italic',
    },
    s: {
        textDecorationLine: 'line-through',
    },

    // Paragraph - matching Next.js: mb-4
    text: {
        color: '#4b5563',  // Even darker gray (gray-600)
    },
    paragraph: {
        marginTop: 0,
        marginBottom: 16,  // mb-4
    },

    // Lists - matching Next.js: list-disc pl-5 mb-4
    bullet_list: {
        marginBottom: 16,
        paddingLeft: 0,
    },
    ordered_list: {
        marginBottom: 16,
        paddingLeft: 0,
    },
    // List item - matching Next.js: mb-1
    list_item: {
        marginBottom: 4,
        flexDirection: 'row',
    },
    bullet_list_icon: {
        color: '#8b5cf6',
        marginRight: 8,
        fontSize: 8,
        lineHeight: 24,
    },
    ordered_list_icon: {
        color: '#8b5cf6',
        marginRight: 8,
        fontSize: 14,
        lineHeight: 24,
    },
    bullet_list_content: {
        flex: 1,
    },
    ordered_list_content: {
        flex: 1,
    },

    // Code - inline and blocks
    code_inline: {
        backgroundColor: '#374151',
        color: '#e5e7eb',  // Lighter text on dark bg
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: 'monospace',
        fontSize: 13,
    },
    fence: {
        backgroundColor: '#58677dff',
        padding: 16,
        borderRadius: 8,
        marginVertical: 12,
    },
    code_block: {
        color: '#e5e7eb',  // Lighter text on dark bg
        fontFamily: 'monospace',
        fontSize: 13,
    },

    // Horizontal rule - matching Next.js: my-4 border-gray-200
    hr: {
        backgroundColor: '#374151',
        height: 1,
        marginVertical: 16,
    },

    // Links
    link: {
        color: '#8b5cf6',
        textDecorationLine: 'underline',
    },

    // Blockquote / Note section
    blockquote: {
        backgroundColor: '#6c84a690',
        borderLeftColor: '#8b5cf6',
        borderLeftWidth: 4,
        paddingLeft: 16,
        paddingVertical: 8,
        marginVertical: 12,
    },
    // Text inside blockquote - lighter for dark bg
    blockquote_text: {
        color: '#f3f4f6',  // Very light text for dark bg
    },

    // Table
    table: {
        borderWidth: 1,
        borderColor: '#374151',
        marginVertical: 12,
    },
    thead: {
        backgroundColor: '#adcfffff',
    },
    th: {
        color: '#f9fafb',  // Very light text for dark header bg
        fontWeight: 'bold',
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#374151',
    },
    td: {
        color: '#f3f4f6',  // Light text for table cells
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#374151',
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    tr: {
        flexDirection: 'row',
    },
});
