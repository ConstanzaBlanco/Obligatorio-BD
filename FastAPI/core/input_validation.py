from fastapi import HTTPException
import re

def asegurar_input(valor: str, campo: str):
    """
    Valida inputs contra patrones de SQL injection comunes.
    """

    if valor is None:
        return True

    v = str(valor).lower().strip()

    patrones = [
        r"--",
        r";",
        r"/\*",
        r"\*/",
        r"@@",
        r"char\(",
        r"nchar\(",
        r"varchar\(",
        r"\binsert\b",
        r"\bupdate\b",
        r"\bdelete\b",
        r"\bdrop\b",
        r"\balter\b",
        r"insert\s+into",
        r"delete\s+from",
        r"update\s+\w+",
        r"alter\s+table",
        r"drop\s+table",
        r"drop\s+database",
        r"or\s+1\s*=\s*1",
        r"and\s+1\s*=\s*1",
        r"union\s+select",
    ]

    for patron in patrones:
        if re.search(patron, v):
            raise HTTPException(
                status_code=400,
                detail=f"Entrada inválida detectada en el campo '{campo}'."
            )

    return True
