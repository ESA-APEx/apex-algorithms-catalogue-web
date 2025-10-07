#!/bin/bash

PREVIEW_DIR="preview/pr-preview"
VERSIONS_FILE="preview/versions.csv"

echo "pr_number,last_updated" > "$VERSIONS_FILE"

if [ -d "$PREVIEW_DIR" ]; then
    # Find all PR directories and extract PR numbers
    for pr_dir in "$PREVIEW_DIR"/pr-*; do
        if [ -d "$pr_dir" ]; then
            # Extract PR number from directory name (pr-123 -> 123)
            pr_number=$(basename "$pr_dir" | sed 's/pr-//')            
            last_updated=$(stat -c "%y" "$pr_dir" | cut -d'.' -f1)
            echo "$pr_number,$last_updated" >> "$VERSIONS_FILE"
        fi
    done
    
    (head -n 1 "$VERSIONS_FILE" && tail -n +2 "$VERSIONS_FILE" | sort -t',' -k1,1n) > "$VERSIONS_FILE.tmp"
    mv "$VERSIONS_FILE.tmp" "$VERSIONS_FILE"
    
    echo "Generated versions.csv with $(( $(wc -l < "$VERSIONS_FILE") - 1 )) PR entries"
else
    echo "Preview directory not found, creating empty versions.csv"
fi

# Display the contents
echo "Contents of versions.csv:"
cat "$VERSIONS_FILE"