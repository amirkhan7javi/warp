import pytest
import os

from starkware.starknet.compiler.compile import compile_starknet_files
from starkware.starknet.testing.state import StarknetState

warp_root = os.path.abspath(os.path.join(__file__, "../../.."))
test_dir = __file__


@pytest.mark.asyncio
async def test_starknet():
    contract_file = test_dir[:-8] + ".cairo"
    cairo_path = f"{warp_root}/warp/cairo-src"
    contract_definition = compile_starknet_files(
        [contract_file], debug_info=True, cairo_path=[cairo_path]
    )

    starknet = await StarknetState.empty()
    contract_address = await starknet.deploy(contract_definition=contract_definition)

    res = await starknet.invoke_raw(
        contract_address=contract_address,
        selector="fun_payableFunction_external",
        calldata=[510, 0, 40, 0, 21, 0, 450, 0],
    )

    assert res.retdata == [451, 0]