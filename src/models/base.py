from bson import ObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema
from typing import Any

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x),
                info_arg=False,
                return_schema=core_schema.str_schema(),
            ),
        )

    @classmethod
    def validate(cls, v: Any) -> str:
        if not isinstance(v, (str, ObjectId)):
            raise ValueError("Invalid ObjectId")
        if isinstance(v, str) and not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId string")
        return str(v)
