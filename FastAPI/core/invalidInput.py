def isInvalidInput(value: str) -> bool:
    if value is None or value.strip() == "":
        return True

    forbidden = [
        "--", ";", "/*", "*/", "@@", "@",
        "char", "nchar", "varchar", "alter", "begin", "cast",
        "create", "cursor", "declare", "delete", "drop",
        "end", "exec", "execute", "fetch", "insert",
        "kill", "select", "sys", "sysobjects", "syscolumns",
        "table", "update"
    ]

    text = value.lower()

    for bad in forbidden:
        if bad in text:
            return True

    return False
