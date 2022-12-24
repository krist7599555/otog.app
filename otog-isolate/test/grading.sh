local_binary=$(mktemp)
compile_error_message="$(g++ -std=c++20 $SOURCECODE_PATH -o $local_binary 2>&1)"
chmod +x "$local_binary"

if [ ! -z "$compile_error_message" ]; then
    echo "COMPILE ERROR"
    echo "$compile_error_message"
    exit 1
fi

for i in $(seq 1 $TESTCASE_COUNT); do
    ANSWER=$($local_binary <"testcases/$i.in" 2>/dev/null)
    EXITCODE=$?
    if [ $EXITCODE -ne 0 ]; then
        printf "X"
        continue
    fi

    if [ -z "$(diff -bB "testcases/$i.sol" <(echo "$ANSWER"))" ]; then
        # The file empty. = file is equal
        printf "P"
    else
        # The file is not-empty.
        printf "-"
    fi
done

rm "$local_binary"

echo # new line
